import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenProbe",
  description: "Solana token intelligence for AI agents. One endpoint, pay per query.",
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
