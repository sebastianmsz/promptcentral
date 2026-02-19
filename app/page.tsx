import React, { Suspense } from "react";
import Feed from "@components/Feed";
import Spinner from "@components/Spinner";
import JsonLd from "@components/JsonLd";

const HeroSection = () => (
	<div className="mx-auto max-w-7xl space-y-6 py-12 text-center">
		<h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
			Master AI Prompting with{" "}
			<span className="red_gradient mt-2 block">Prompteria</span>
		</h1>
		<p className="mx-auto max-w-2xl text-xl text-gray-600">
			Your collaborative hub for sharing powerful AI prompts that deliver
			results
		</p>
	</div>
);

export const generateMetadata = async () => {
	try {
		const response = await fetch(`${process.env.NEXTAUTH_URL}/api/prompt`);
		const { pagination } = await response.json();
		const totalPrompts = pagination?.total || 0;

		return {
			title: "Explore AI Prompts",
			description: `Join our community of ${totalPrompts}+ AI prompts. Share, discover, and learn from prompt engineers worldwide.`,
			openGraph: {
				title: "Explore AI Prompts | Prompteria",
				description: `Browse our collection of ${totalPrompts}+ AI prompts shared by the community`,
			},
		};
	} catch {
		return {
			title: "Explore AI Prompts",
			description:
				"Discover and share AI prompts with a global community of prompt engineers.",
		};
	}
};

const Home = () => {
	const websiteStructuredData = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Prompteria",
		url: process.env.NEXTAUTH_URL,
		description:
			"Discover and share powerful AI prompts with a global community",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${process.env.NEXTAUTH_URL}/?search={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	const organizationStructuredData = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Prompteria",
		url: process.env.NEXTAUTH_URL,
		logo: `${process.env.NEXTAUTH_URL}/assets/img/logo.svg`,
		sameAs: ["https://github.com/sebastianmsz/promptcentral"],
	};

	return (
		<main className="flex min-h-screen flex-col items-center px-4 sm:px-8">
			<JsonLd data={websiteStructuredData} />
			<JsonLd data={organizationStructuredData} />
			<HeroSection />
			<Suspense fallback={<Spinner />}>
				<Feed />
			</Suspense>
		</main>
	);
};

export default Home;
