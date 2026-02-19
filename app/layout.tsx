import "@styles/global.css";
import React from "react";
import Provider from "@components/Provider";
import { ThemeProvider } from "@components/ThemeProvider";
import Nav from "@components/Nav";
import ErrorBoundary from "@components/ErrorBoundary";

export const metadata = {
  metadataBase: new URL("https://prompteria.com"),
  title: {
    default: "Prompteria - Share AI Prompts",
    template: "%s | Prompteria"
  },
  description: "Discover and share powerful AI prompts with a global community. Find inspiration, collaborate, and enhance your AI interactions.",
  keywords: ["AI prompts", "artificial intelligence", "prompt engineering", "AI community", "prompt sharing"],
  authors: [{ name: "Sebastian Molina" }],
  creator: "Sebastian Molina",
  publisher: "Prompteria",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prompteria.com",
    siteName: "Prompteria",
    title: "Prompteria - Share AI Prompts",
    description: "Discover and share powerful AI prompts with a global community",
    images: [
      {
        url: "/assets/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prompteria - AI Prompt Sharing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompteria - Share AI Prompts",
    description: "Discover and share powerful AI prompts with a global community",
    images: ["/assets/img/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Provider>
            <div className="main">
              <div className="gradient" />
            </div>
            <main className="app">
              <Nav />
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
