"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { PromptCardProps as Props } from "@types";
import { useSession, signIn } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JsonLd from "@components/JsonLd";
import { Heart, Eye } from "lucide-react";

const PromptCard: React.FC<Props> = ({
	post,
	handleTagClick,
	isProfilePage,
	onDelete,
}) => {
	const { data: session } = useSession() as { data: Session | null };
	const [isMaximized, setIsMaximized] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [copied, setCopied] = useState("");
	const [deleting, setDeleting] = useState(false);
	const [likes, setLikes] = useState<string[]>(post.likes || []);
	const [views, setViews] = useState<number>(post.views || 0);
	const [hasLiked, setHasLiked] = useState<boolean>(
		post.likes?.includes(session?.user?.id || "") || false
	);
	const router = useRouter();
	const modalRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const hasTrackedView = useRef(false);

	const isCurrentUserPost = session?.user?.id === post.creator?._id;

	const maxTagsToDisplay = 3;
	const tagsToDisplay = post.tag.slice(0, maxTagsToDisplay);
	const hasMoreTags = post.tag.length > maxTagsToDisplay;

	const handleCopy = () => {
		setCopied(post.prompt);
		navigator.clipboard.writeText(post.prompt);
		setTimeout(() => {
			setCopied("");
		}, 2000);
	};

	const handleLike = async (event: React.MouseEvent) => {
		event.stopPropagation();
		
		if (!session?.user) {
			signIn("google");
			return;
		}

		// Store previous state for potential revert
		const prevHasLiked = hasLiked;
		const prevLikes = likes;

		// Optimistic update
		const newHasLiked = !hasLiked;
		const newLikes = newHasLiked
			? [...likes, session.user.id]
			: likes.filter((id) => id !== session.user.id);

		setHasLiked(newHasLiked);
		setLikes(newLikes);

		try {
			const response = await fetch(`/api/prompt/${post._id}/like`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to toggle like");
			}

			const data = await response.json();
			setLikes(data.likes);
			setHasLiked(data.hasLiked);
		} catch (error) {
			console.error("Error toggling like:", error);
			// Revert to previous state on error
			setHasLiked(prevHasLiked);
			setLikes(prevLikes);
		}
	};

	const trackView = useCallback(async () => {
		if (!post._id || hasTrackedView.current) return;
		
		try {
			const response = await fetch(`/api/prompt/${post._id}/view`, {
				method: "POST",
			});

			if (response.ok) {
				const data = await response.json();
				setViews(data.views);
				hasTrackedView.current = true;
			}
		} catch (error) {
			console.error("Error tracking view:", error);
		}
	}, [post._id]);

	const handleDeleteClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		setIsDeleteModalOpen(false);
		setDeleting(true);
		try {
			if (post._id && onDelete) {
				onDelete(post._id, true);
				const response = await fetch(`/api/prompt/${post._id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error(`An error has occurred: ${response.status}`);
				}
			} else {
				throw new Error("Post id is missing or onDelete not provided");
			}
		} catch (error) {
			console.error("An error occurred:", error);
			if (post._id) {
				onDelete?.(post._id, false);
			}
		} finally {
			setDeleting(false);
		}
	};

	const handleEdit = useCallback(() => {
		if (session?.user && post._id) {
			router.push(`/edit-prompt?id=${post._id}`);
		} else {
			signIn("google");
		}
		setIsMaximized(false);
	}, [router, session, post]);

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
	};

	const handleMaximize = (event: React.MouseEvent) => {
		event.stopPropagation();
		setIsMaximized(true);
		trackView();
	};

	const handleCloseMaximize = () => {
		setIsMaximized(false);
	};

	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (backdropRef.current && backdropRef.current === event.target) {
			handleCloseMaximize();
		}
	}, []);

	useEffect(() => {
		if (isMaximized) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMaximized, handleClickOutside]);

	const onTagClick = useCallback(
		(tag: string, isModal: boolean) => {
			handleTagClick?.(tag);
			if (isModal) {
				handleCloseMaximize();
			}
		},
		[handleTagClick],
	);

	const promptStructuredData = {
		"@context": "https://schema.org",
		"@type": "Article",
		"headline": `AI Prompt by ${post.creator?.name}`,
		"author": {
			"@type": "Person",
			"name": post.creator?.name,
			"image": post.creator?.image
		},
		"description": post.prompt,
		"keywords": post.tag.join(", "),
		"datePublished": post._id ? new Date(parseInt(post._id.substring(0, 8), 16) * 1000).toISOString() : new Date().toISOString(),
		"publisher": {
			"@type": "Organization",
			"name": "Prompt Central",
			"logo": {
				"@type": "ImageObject",
				"url": `${process.env.NEXTAUTH_URL}/assets/img/logo.svg`
			}
		}
	};

	const renderUserInfo = () => (
		<Link
			href={`/profile/${post.creator?._id}`}
			className="flex w-full items-center gap-2 sm:max-w-[70%] sm:gap-3"
			onClick={(event) => event.stopPropagation()}
		>
			<Image
				src={post.creator?.image || "/assets/img/default-user.svg"}
				alt="user_image"
				width={32}
				height={32}
				className="rounded-full object-contain ring-2 ring-gray-200 dark:ring-gray-700 sm:h-10 sm:w-10"
			/>
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-satoshi text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
					{post.creator?.name}
				</h3>
				<p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
					{post.creator?.email}
				</p>
			</div>
		</Link>
	);

	const renderButtons = () =>
		isProfilePage &&
		isCurrentUserPost && (
			<div className="mt-3 flex justify-end gap-2 sm:mt-4">
				<button
					onClick={(event) => {
						event.stopPropagation();
						handleEdit();
					}}
					className="rounded-md bg-blue-500 px-2 py-1 text-xs text-white sm:px-3 sm:text-sm"
				>
					Edit
				</button>
				<button
					onClick={handleDeleteClick}
					disabled={deleting}
					className="rounded-md bg-red-500 px-2 py-1 text-xs text-white sm:px-3 sm:text-sm"
				>
					{deleting ? "Deleting..." : "Delete"}
				</button>
			</div>
		);

	const renderTags = (isModal: boolean) =>
		(isModal ? post.tag : tagsToDisplay).map((tag, index) => (
			<button
				key={index}
				className="blue_gradient cursor-pointer truncate font-inter text-sm decoration-blue-500 hover:underline"
				onClick={(event) => {
					event.stopPropagation();
					onTagClick(tag, isModal);
				}}
			>
				#{tag}
			</button>
		));

	const renderContent = (isModal = false) => (
		<div className="flex h-full flex-col">
			<div className="flex items-start justify-between gap-4">
				{renderUserInfo()}
				<div className="flex items-center gap-2">
					<button
						onClick={(event) => {
							event.stopPropagation();
							handleCopy();
						}}
						className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						<Image
							src={copied ? "/assets/icons/tick.svg" : "/assets/icons/copy.svg"}
							alt="Copy icon"
							width={18}
							height={18}
						/>
					</button>
					{isModal && (
						<button
							onClick={handleCloseMaximize}
							className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="h-5 w-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
				</div>
			</div>

			<div className="mt-4 flex-grow">
				<p
					className={`font-satoshi text-sm text-gray-700 dark:text-gray-300 ${
						isModal
							? "max-h-[40vh] overflow-auto"
							: "line-clamp-2 cursor-pointer"
					}`}
				>
					{post.prompt}
				</p>
			</div>

			<div className="mt-4 space-y-4">
				<div className="flex items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-2">
						{renderTags(isModal)}
						{hasMoreTags && !isModal && (
							<span className="text-xs text-gray-500">
								+{post.tag.length - maxTagsToDisplay}
							</span>
						)}
					</div>
					<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
						<button
							onClick={handleLike}
							className="flex items-center gap-1 transition-colors hover:text-red-500"
						>
							<Heart
								className={`h-4 w-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
							/>
							<span>{likes.length}</span>
						</button>
						<div className="flex items-center gap-1">
							<Eye className="h-4 w-4" />
							<span>{views}</span>
						</div>
					</div>
				</div>
				{renderButtons()}
			</div>
		</div>
	);

	return (
		<>
			<JsonLd data={promptStructuredData} />
			{isDeleteModalOpen && (
				<div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50 p-4">
					<div className="w-full max-w-[95%] rounded-md bg-white p-4 shadow-lg dark:bg-dark-surface sm:w-96 sm:max-w-none sm:p-6">
						<h2 className="mb-3 text-lg font-bold dark:text-white sm:mb-4 sm:text-xl">
							Confirm Delete
						</h2>
						<p className="mb-4 text-sm dark:text-gray-300 sm:mb-6 sm:text-base">
							Are you sure you want to delete this post?
						</p>
						<div className="flex justify-end gap-2 sm:gap-4">
							<button
								onClick={handleCloseDeleteModal}
								className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:px-4 sm:py-2 sm:text-base"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmDelete}
								className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 sm:px-4 sm:py-2 sm:text-base"
							>
								Confirm Delete
							</button>
						</div>
					</div>
				</div>
			)}

			<div
				className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-dark-surface dark:shadow-gray-800/10 sm:p-5"
				onClick={handleMaximize}
				ref={modalRef}
			>
				{renderContent()}
			</div>

			{isMaximized && (
				<div
					className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
					ref={backdropRef}
				>
					<div
						className="relative max-h-[95vh] w-full max-w-[95%] overflow-auto rounded-xl bg-white p-4 shadow-xl dark:bg-dark-surface sm:max-h-[90vh] sm:max-w-2xl sm:p-6"
						ref={modalRef}
					>
						{renderContent(true)}
					</div>
				</div>
			)}
		</>
	);
};

export default PromptCard;
