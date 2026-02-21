"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Profile from "@components/Profile";
import { Post } from "@types";
import Spinner from "@components/Spinner";
import usePromptList from "@app/hooks/usePromptList";
import { Session } from "next-auth";

const MyProfile = () => {
	const { data: session } = useSession() as {
		data: Session | null;
		status: string;
	};
	const userId = session?.user?.id;

	const {
		data: initialPosts,
		loading,
		error,
		page,
		totalPages,
		handleLoadMore,
		refreshData,
	} = usePromptList<Post>({
		apiEndpoint: userId ? `/api/users/${userId}/posts` : "",
	});

	const {
		data: initialLikedPosts,
		loading: likedLoading,
		page: likedPage,
		totalPages: likedTotalPages,
		handleLoadMore: handleLoadMoreLiked,
	} = usePromptList<Post>({
		apiEndpoint: userId ? `/api/users/${userId}/likes` : "",
	});

	const [myPosts, setMyPosts] = useState<Post[]>(initialPosts);
	const [likedPosts, setLikedPosts] = useState<Post[]>(initialLikedPosts);

	useEffect(() => {
		setMyPosts(initialPosts);
	}, [initialPosts]);

	useEffect(() => {
		setLikedPosts(initialLikedPosts);
	}, [initialLikedPosts]);

	const handleDelete = useCallback(
		(postId: string, optimistic?: boolean) => {
			if (optimistic) {
				setMyPosts((prevPosts) =>
					prevPosts.filter((post) => post._id !== postId),
				);
			} else {
				refreshData();
			}
		},
		[refreshData],
	);

	const profileDescription = useMemo(() => {
		return `Welcome back, ${session?.user?.name || "Unknown"}`;
	}, [session?.user?.name]);

	if (loading && likedLoading) {
		return <Spinner />;
	}
	if (error) {
		return <p>Error: {error}</p>;
	}
	if (!session?.user?.id) {
		return <p>Not signed in</p>;
	}

	return (
		<Profile
			name={session.user.name || "Unknown"}
			desc={profileDescription}
			data={myPosts}
			likedData={likedPosts}
			page={page}
			totalPages={totalPages}
			onLoadMore={handleLoadMore}
			likedPage={likedPage}
			likedTotalPages={likedTotalPages}
			onLoadMoreLiked={handleLoadMoreLiked}
			isCurrentUserProfile={true}
			isProfilePage={true}
			onDelete={handleDelete}
		/>
	);
};

export default MyProfile;

