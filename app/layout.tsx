import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
 
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS-Lite - Transparent AI Candidate Matching",
  description:
    "Watch the ATS think - Transparent AI-powered candidate matching with real-time workflow visualization",
  keywords: [
    "ATS",
    "AI",
    "candidate matching",
    "recruitment",
    "transparent AI",
  ],
  authors: [{ name: "Brian Miles" }],
  openGraph: {
    title: "ATS-Lite - Transparent AI Candidate Matching",
    description:
      "Watch the ATS think - Real-time AI workflow visualization for candidate matching",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
