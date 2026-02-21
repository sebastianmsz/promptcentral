import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import { NextResponse, NextRequest } from "next/server";

interface Params {
	id: string;
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<Params> },
) {
	try {
		const { id } = await params;
		await connectToDb();

		if (!id) {
			return NextResponse.json(
				{ message: "Missing prompt id" },
				{ status: 400 },
			);
		}

		const prompt = await Prompt.findByIdAndUpdate(
			id,
			{ $inc: { views: 1 } },
			{ new: true },
		);

		if (!prompt) {
			return NextResponse.json(
				{ message: "Prompt not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "View counted", views: prompt.views },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error tracking view:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred";

		return NextResponse.json(
			{
				message: "Failed to track view",
				error: errorMessage,
			},
			{ status: 500 },
		);
	}
}
