import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create Prompt',
  description: 'Share your AI prompts with the community. Create and publish your prompt engineering insights.',
  openGraph: {
    title: 'Create New Prompt | Prompteria',
    description: 'Share your AI prompts with the community',
  },
};

export default function CreatePromptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
