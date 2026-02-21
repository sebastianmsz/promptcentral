"use client";

import React, { useState, useCallback, useMemo } from "react";
import PromptCard from "./PromptCard";
import { ProfileProps } from "@types";
import { useRouter } from "next/navigation";
import JsonLd from "@components/JsonLd";
import { Heart, LayoutGrid } from "lucide-react";

type TabId = "posts" | "liked";

const Profile: React.FC<ProfileProps> = ({
	name,
	desc,
	data,
	likedData,
	page,
	totalPages,
	onLoadMore,
	likedPage,
	likedTotalPages,
	onLoadMoreLiked,
	isCurrentUserProfile,
	isProfilePage,
	onDelete,
}) => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabId>("posts");

	const handleTagClick = useCallback(
		(tag: string) => {
			router.push(`/?tag=${encodeURIComponent(tag)}`);
		},
		[router],
	);

	const profileStructuredData = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		name: `${name}'s Profile`,
		description: desc,
		author: {
			"@type": "Person",
			name: name,
		},
		interactionStatistic: {
			"@type": "InteractionCounter",
			interactionType: "https://schema.org/WriteAction",
			userInteractionCount: data.length,
		},
	};

	const activeData = activeTab === "posts" ? data : (likedData ?? []);
	const activePage = activeTab === "posts" ? page : likedPage;
	const activeTotalPages = activeTab === "posts" ? totalPages : likedTotalPages;
	const handleActiveLoadMore = activeTab === "posts" ? onLoadMore : onLoadMoreLiked;

	const memoizedPromptCards = useMemo(
		() =>
			activeData.map((prompt) => (
				<PromptCard
					key={prompt._id}
					post={prompt}
					handleTagClick={handleTagClick}
					isCurrentUserProfile={isCurrentUserProfile && activeTab === "posts"}
					isProfilePage={isProfilePage}
					onDelete={activeTab === "posts" ? onDelete : undefined}
				/>
			)),
		[activeData, isCurrentUserProfile, isProfilePage, handleTagClick, onDelete, activeTab],
	);

	const showLikedTab = likedData !== undefined;

	return (
		<section className="w-full">
			<JsonLd data={profileStructuredData} />
			<h1 className="head_text text-left">
				<span className="blue_gradient">{name}&apos;s</span> profile
			</h1>
			<p className="desc text-left">{desc}</p>

			{showLikedTab && (
				<div className="mt-6 mb-2 flex gap-2 border-b border-gray-200 dark:border-gray-700">
					<button
						onClick={() => setActiveTab("posts")}
						className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
							activeTab === "posts"
								? "border-blue-500 text-blue-600 dark:text-blue-400"
								: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						}`}
					>
						<LayoutGrid size={16} />
						Posts
					</button>
					<button
						onClick={() => setActiveTab("liked")}
						className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
							activeTab === "liked"
								? "border-blue-500 text-blue-600 dark:text-blue-400"
								: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						}`}
					>
						<Heart size={16} />
						Liked
					</button>
				</div>
			)}

			<div className="prompt_grid mt-4">{memoizedPromptCards}</div>

			{handleActiveLoadMore && activePage !== undefined && activeTotalPages !== undefined && activePage < activeTotalPages && (
				<div className="flex justify-center mt-6">
					<button onClick={handleActiveLoadMore} className="black_btn mb-4">
						Load More
					</button>
				</div>
			)}
		</section>
	);
};

export default Profile;
