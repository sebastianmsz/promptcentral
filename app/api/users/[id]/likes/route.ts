import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const DEFAULT_PAGE = 1;
		const DEFAULT_LIMIT = 12;
		const searchParams = request.nextUrl.searchParams;
		const page = Math.max(
			DEFAULT_PAGE,
			parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10),
		);
		const limit = Math.max(
			DEFAULT_LIMIT,
			parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10),
		);
		const skip = (page - 1) * limit;

		if (!id) {
			return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
		}

		await connectToDb();

		const userObjectId = new mongoose.Types.ObjectId(id);
		const total = await Prompt.countDocuments({ likes: userObjectId });
		const prompts = await Prompt.find({ likes: userObjectId })
			.populate("creator", "name email image")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		return NextResponse.json({
			prompts,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error: unknown) {
		console.error("Error fetching user's liked prompts:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch liked prompts",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
