import { Metadata } from "next";
import UserProfileClient from "./UserProfileClient";

interface Props {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	try {
		const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${id}`);
		const { user } = await response.json();

		return {
			title: `${user.name}'s Profile`,
			description: `Check out ${user.name}'s AI prompts and contributions on Prompteria`,
			openGraph: {
				title: `${user.name}'s Profile | Prompteria`,
				description: `Discover AI prompts shared by ${user.name}`,
				images: [user.image || "/assets/img/default-user.svg"],
			},
		};
	} catch {
		return {
			title: "User Profile",
			description: "View user profile and their AI prompts on Prompteria",
		};
	}
}

export default async function UserProfile({ params }: Props) {
	const { id } = await params;

	let initialUser = null;
	try {
		const response = await fetch(
			`${process.env.NEXTAUTH_URL}/api/users/${id}`,
			{
				cache: "no-store",
			},
		);
		if (response.ok) {
			const { user } = await response.json();
			initialUser = user;
		}
	} catch (error) {
		console.error("Failed to fetch user:", error);
	}

	return <UserProfileClient initialUser={initialUser} />;
}
