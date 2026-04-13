import type { Metadata } from "next";
import { Libre_Baskerville, DM_Sans } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThreadKey — AI Series Bible for Fiction Authors",
  description:
    "ThreadKey automatically builds a living series bible from your manuscripts. Track characters, locations, timelines, and world-building rules. Catch continuity errors before your readers do.",
  keywords: [
    "series bible",
    "fiction writing",
    "continuity checker",
    "AI writing tool",
    "novel writing",
    "story bible",
  ],
  openGraph: {
    title: "ThreadKey — AI Series Bible for Fiction Authors",
    description:
      "Never lose track of your story again. ThreadKey builds your series bible automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-parchment text-ink-blue">
        {children}
      </body>
    </html>
  );
}
