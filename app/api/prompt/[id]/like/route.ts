import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@app/api/auth/[...nextauth]/route";

interface Params {
	id: string;
}

// Toggle like on a prompt
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<Params> },
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectToDb();

		if (!id) {
			return NextResponse.json(
				{ message: "Missing prompt id" },
				{ status: 400 },
			);
		}

		const prompt = await Prompt.findById(id);

		if (!prompt) {
			return NextResponse.json(
				{ message: "Prompt not found" },
				{ status: 404 },
			);
		}

		const userId = (session.user as { id: string }).id;
		const likes = prompt.likes || [];
		const hasLiked = likes.some(
			(like: mongoose.Types.ObjectId) => like.toString() === userId,
		);

		if (hasLiked) {
			// Remove like
			prompt.likes = likes.filter(
				(like: mongoose.Types.ObjectId) => like.toString() !== userId,
			);
		} else {
			// Add like
			prompt.likes = [...likes, userId];
		}

		await prompt.save();

		return NextResponse.json(
			{
				likes: prompt.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
				likesCount: prompt.likes.length,
				hasLiked: !hasLiked,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error toggling like:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred";

		return NextResponse.json(
			{ error: "Failed to toggle like", details: errorMessage },
			{ status: 500 },
		);
	}
}
