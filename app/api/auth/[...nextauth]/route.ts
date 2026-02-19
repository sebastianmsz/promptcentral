import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@models/user";
import { connectToDb } from "@utils/database";
import { Session, Profile } from "next-auth";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async session({ session }: { session: Session }): Promise<Session> {
			await connectToDb();
			if (!session.user?.email) {
				throw new Error("Session does not have a user email");
			}
			const sessionUser = await User.findOne({ email: session.user.email });

			if (!sessionUser) {
				throw new Error("User not found in database");
			}

			return {
				...session,
				user: {
					...session.user,
					id: sessionUser._id.toString(),
					name: sessionUser.name,
					image: sessionUser.image,
				},
			};
		},
		async signIn({ profile }: { profile?: Profile }): Promise<boolean> {
			try {
				await connectToDb();
				if (profile && profile.email) {
					const userExists = await User.findOne({ email: profile.email });
					if (!userExists) {
						let name =
							profile.name?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
							profile.email.split("@")[0];
						const userCount = await User.countDocuments({});
						if (userCount > 0) {
							name += userCount;
						}
						await User.create({
							email: profile.email,
							name: name,
							image: profile.picture,
						});
					}
				}
				return true;
			} catch (error) {
				console.error("Error during sign in:", error);
				return false;
			}
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
