import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "TokenProbe",
  description: "Fix your Solana taxes for $10. Clean CSV export of all your swaps, transfers, and airdrops — including Jupiter, pump.fun, and Raydium. No subscription.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
