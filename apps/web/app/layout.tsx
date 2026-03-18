import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medieval Chess",
  description: "Explore the history of chess through medieval variants, puzzles, and community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
