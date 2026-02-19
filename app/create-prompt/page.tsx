"use client";

import React, { useEffect } from "react";
import { useState, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Form from "@components/Form";
import { Post } from "@types";
import { Session } from "next-auth";

type StatusType = "loading" | "authenticated" | "unauthenticated";

const CreatePrompt = () => {
	const router = useRouter();
	const { data: session, status } = useSession() as {
		data: Session | null;
		status: StatusType;
	};

	useEffect(() => {
		if (status !== "loading" && status !== "authenticated") {
			signIn("google");
		}
	}, [session, status, router]);

	const [submitting, setSubmitting] = useState<boolean>(false);
	const [post, setPost] = useState<Partial<Post>>({
		prompt: "",
		tag: [],
	});
	const [error, setError] = useState<string | null>(null);

	const createPrompt = async (e: FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			if (!session?.user?.id) {
				setError("User not logged in");
				return;
			}
			const response = await fetch("/api/prompt/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: post.prompt,
					userId: session.user.id,
					tag: post.tag,
				}),
			});

			if (response.ok) {
				router.push("/");
			} else {
				const errorData = await response.json();
				setError(errorData.message || "Failed to create prompt");
				console.error("Failed to create prompt:", errorData);
			}
		} catch (error) {
			let errorMessage = "An unknown error occurred";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			setError(errorMessage);
			console.error("An error occurred:", error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			{error && <div className="text-red-500">{error}</div>}
			<Form
				type="Create"
				post={post as Post}
				setPost={(updatedPost) => setPost(updatedPost)}
				submitting={submitting}
				handleSubmit={createPrompt}
			/>
		</>
	);
};

export default CreatePrompt;
