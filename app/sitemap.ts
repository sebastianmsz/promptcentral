import { MetadataRoute } from "next";
import { connectToDb } from "@utils/database";
import Prompt from "@models/prompt";
import User from "@models/user";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

	const routes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/create-prompt`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		},
	];

	try {
		await connectToDb();
		const prompts = await Prompt.find({}).select("_id").lean();
		const users = await User.find({}).select("_id").lean();

		const promptRoutes = prompts.map((prompt) => ({
			url: `${baseUrl}/prompt/${prompt._id}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.6,
		}));

		const userRoutes = users.map((user) => ({
			url: `${baseUrl}/profile/${user._id}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.7,
		}));

		return [...routes, ...promptRoutes, ...userRoutes];
	} catch (error) {
		console.error("Error generating sitemap:", error);
		// Return base routes if database connection fails
		return routes;
	}
}
