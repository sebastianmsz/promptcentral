"use client";

import React, { useEffect, useCallback, Suspense } from "react";
import { useState, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Form from "@components/Form";
import { Post } from "@types";
import { Session } from "next-auth";
import Spinner from "@components/Spinner";

type StatusType = "loading" | "authenticated" | "unauthenticated";

const EditPrompt = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const promptId = searchParams.get("id");

	const { data: session, status } = useSession() as {
		data: Session | null;
		status: StatusType;
	};

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [post, setPost] = useState<Partial<Post>>({
		prompt: "",
		tag: [],
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "loading" && status !== "authenticated") {
			signIn("google");
		}
	}, [session, status, router]);

	const fetchPromptData = useCallback(async () => {
		if (promptId) {
			const controller = new AbortController();
			const signal = controller.signal;

			setLoading(true);
			try {
				const response = await fetch(`/api/prompt/${promptId}`, { signal });
				if (!response.ok) {
					const message = `An error has occurred: ${response.status}`;
					throw new Error(message);
				}
				const data: Post = await response.json();
				setPost({
					prompt: data.prompt,
					tag: data.tag,
				});
			} catch (err: unknown) {
				if (err instanceof Error && err.name === "AbortError") {
					console.log("Fetch aborted");
				} else {
					let errorMessage = "An unknown error occurred";
					if (err instanceof Error) {
						errorMessage = err.message;
					}
					console.error("Error fetching user data:", err);
					setError(errorMessage);
				}
			} finally {
				setLoading(false);
			}

			return () => {
				controller.abort();
			};
		} else {
			setLoading(false);
		}
	}, [promptId]);

	useEffect(() => {
		fetchPromptData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [promptId]);

	const updatePrompt = async (e: FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			if (!promptId) {
				setError("Missing prompt id");
				return;
			}
			const response = await fetch(`/api/prompt/${promptId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: post.prompt,
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

	if (loading) {
		return <Spinner />;
	}
	if (error) {
		return <p>Error: {error}</p>;
	}

	return (
		<>
			{error && <div className="text-red-500">{error}</div>}
			<Form
				type="Edit"
				post={post as Post}
				setPost={(updatedPost) => setPost(updatedPost)}
				submitting={submitting}
				handleSubmit={updatePrompt}
			/>
		</>
	);
};

const EditPromptPage = () => {
	return (
		<Suspense fallback={<Spinner />}>
			<EditPrompt />
		</Suspense>
	);
};

export default EditPromptPage;
