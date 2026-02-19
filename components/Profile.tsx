import React, { useCallback, useMemo } from "react";
import PromptCard from "./PromptCard";
import { ProfileProps } from "@types";
import { useRouter } from "next/navigation";
import JsonLd from "@components/JsonLd";

const Profile: React.FC<ProfileProps> = ({
	name,
	desc,
	data,
	isCurrentUserProfile,
	isProfilePage,
	onDelete,
}) => {
	const router = useRouter();

	const handleTagClick = useCallback(
		(tag: string) => {
			router.push(`/?tag=${encodeURIComponent(tag)}`);
		},
		[router],
	);

	const profileStructuredData = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"name": `${name}'s Profile`,
		"description": desc,
		"author": {
			"@type": "Person",
			"name": name
		},
		"interactionStatistic": {
			"@type": "InteractionCounter",
			"interactionType": "https://schema.org/WriteAction",
			"userInteractionCount": data.length
		}
	};

	const memoizedPromptCards = useMemo(
		() =>
			data.map((prompt) => (
				<PromptCard
					key={prompt._id}
					post={prompt}
					handleTagClick={handleTagClick}
					isCurrentUserProfile={isCurrentUserProfile}
					isProfilePage={isProfilePage}
					onDelete={onDelete}
				/>
			)),
		[data, isCurrentUserProfile, isProfilePage, handleTagClick, onDelete],
	);

	return (
		<section className="w-full">
			<JsonLd data={profileStructuredData} />
			<h1 className="head_text text-left">
				<span className="blue_gradient">{name}&apos;s</span> profile
			</h1>
			<p className="desc text-left">{desc}</p>
			<div className="prompt_grid">{memoizedPromptCards}</div>
		</section>
	);
};

export default Profile;
