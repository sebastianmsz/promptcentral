import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

interface Params {
	id: string;
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<Params> },
) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
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

		const userId = (session.user as any).id;
		const likes = prompt.likes || [];
		
		if (likes.includes(userId)) {
			return NextResponse.json(
				{ message: "Already liked" },
				{ status: 400 },
			);
		}

		likes.push(userId);
		prompt.likes = likes;
		await prompt.save();

		return NextResponse.json(
			{ message: "Liked successfully", likes: prompt.likes },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error liking prompt:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred";

		return NextResponse.json(
			{
				message: "Failed to like prompt",
				error: errorMessage,
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<Params> },
) {
	try {
		const session = await getServerSession();
		if (!session?.user) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
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

		const userId = (session.user as any).id;
		const likes = prompt.likes || [];
		
		const index = likes.indexOf(userId);
		if (index === -1) {
			return NextResponse.json(
				{ message: "Not liked yet" },
				{ status: 400 },
			);
		}

		likes.splice(index, 1);
		prompt.likes = likes;
		await prompt.save();

		return NextResponse.json(
			{ message: "Unliked successfully", likes: prompt.likes },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error unliking prompt:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred";

		return NextResponse.json(
			{
				message: "Failed to unlike prompt",
				error: errorMessage,
			},
			{ status: 500 },
		);
	}
}
