import { Session, User } from "next-auth";
import { ReactNode } from "react";

declare module "next-auth" {
	interface Session {
		user: User & { id: string };
	}
	interface User {
		_id: string;
		name: string;
		image: string;
		email: string;
	}
	interface Profile {
		picture?: string;
		name?: string;
		email?: string;
	}
}

export interface Post {
	_id?: string;
	prompt: string;
	tag: string[];
	creator?: User | null;
	likes?: string[];
	views?: number;
}

export interface FeedProps {
	handleTagClick: (tag: string) => void;
}

export interface PromptCardProps {
	post: Post;
	handleTagClick: (tag: string) => void;
	isCurrentUserProfile?: boolean;
	isProfilePage: boolean;
	onDelete?: (postId: string, optimistic?: boolean) => void;
	userId?: string;
}

export interface FormProps {
	type: "Create" | "Edit";
	post: Partial<CreatePost>;
	setPost: (post: Partial<CreatePost>) => void;
	submitting: boolean;
	handleSubmit: (e: React.FormEvent) => void;
}

export type ProviderProps = React.PropsWithChildren<{
	session?: Session | null;
}>;

export interface UserProfileParams {
	[key: string]: string;
	id: string;
}

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
}

export interface ProfileProps {
	name: string;
	desc: string;
	data: Post[];
	likedData?: Post[];
	page?: number;
	totalPages?: number;
	onLoadMore?: () => void;
	likedPage?: number;
	likedTotalPages?: number;
	onLoadMoreLiked?: () => void;
	isCurrentUserProfile: boolean;
	isProfilePage: boolean;
	onDelete?: (postId: string) => void;
}

export interface UserParams {
	id: string;
}

export interface ErrorBoundaryProps {
	children: ReactNode;
}

export interface ErrorBoundaryState {
	hasError: boolean;
}

export interface CreatePost {
	prompt: string;
	tag: string[]; // Make sure tag is an array of strings
	creator?: User | null;
}
