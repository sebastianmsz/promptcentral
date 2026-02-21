import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { User } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@utils/authOptions"; 

interface Params {
	id: string;
}

interface SessionUser extends User {
	id: string;
}

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

		const userId = (session.user as SessionUser).id;
		let prompt = await Prompt.findById(id);

		if (!prompt) {
			return NextResponse.json(
				{ message: "Prompt not found" },
				{ status: 404 },
			);
		}

		// Check if user already liked this prompt
		const alreadyLiked = prompt.likes?.some(
			(likeId: mongoose.Types.ObjectId | string) =>
				likeId.toString() === userId,
		);

		if (!alreadyLiked) {
			const userObjectId = new mongoose.Types.ObjectId(userId);
			prompt = await Prompt.findByIdAndUpdate(
				id,
				{ $addToSet: { likes: userObjectId } },
				{ new: true },
			);
		}

		return NextResponse.json(
			{ message: "Liked successfully", likes: prompt.likes.map((id: mongoose.Types.ObjectId | string) => id.toString()) },
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

		const userId = (session.user as SessionUser).id;
		const userObjectId = new mongoose.Types.ObjectId(userId);

		const prompt = await Prompt.findByIdAndUpdate(
			id,
			{ $pull: { likes: { $in: [userObjectId, userId] } } },
			{ new: true },
		);

		if (!prompt) {
			return NextResponse.json(
				{ message: "Prompt not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Unliked successfully", likes: prompt.likes.map((id: mongoose.Types.ObjectId | string) => id.toString()) },
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
