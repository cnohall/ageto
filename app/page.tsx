import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokenProbe — Solana Tax Export",
  description:
    "Fix your Solana taxes for $10. Clean CSV of all your swaps, transfers, and airdrops — Jupiter, pump.fun, Raydium. No subscription.",
  openGraph: {
    title: "TokenProbe — Solana Tax Export",
    description:
      "Fix your Solana taxes for $10. Clean CSV of all your swaps, transfers, and airdrops — Jupiter, pump.fun, Raydium. No subscription.",
    url: "https://tokenprobe.nohall.dev",
    siteName: "TokenProbe",
    images: [
      {
        url: "https://tokenprobe.nohall.dev/og.png",
        width: 1200,
        height: 630,
        alt: "TokenProbe — Solana Tax Export",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenProbe — Solana Tax Export",
    description:
      "Fix your Solana taxes for $10. Clean CSV of all your swaps, transfers, and airdrops. No subscription.",
    images: ["https://tokenprobe.nohall.dev/og.png"],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-green-300 font-mono">
      {/* Nav */}
      <nav className="border-b border-green-800 px-6 py-4 flex items-center justify-between">
        <span className="text-green-300 font-bold text-lg tracking-tight">
          TokenProbe
        </span>
        <div className="flex items-center gap-6 text-sm text-green-500">
          <a href="#how" className="hover:text-green-300 transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-green-300 transition-colors">
            Pricing
          </a>
          <a
            href="/tax"
            className="border border-green-600 px-3 py-1 hover:border-green-300 hover:text-green-300 transition-colors"
          >
            Get Started →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-green-500 text-sm mb-4 tracking-widest uppercase">
          Solana · Tax Year 2025 · April 15 Deadline
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-green-300 leading-tight mb-6">
          Fix your Solana taxes
          <br />
          for $10.
        </h1>
        <p className="text-green-500 text-lg mb-4 max-w-xl">
          Clean CSV export of every swap, transfer, and airdrop from your Solana
          wallet — with USD values. Works with Jupiter, pump.fun, Raydium, and more.
          Hand it to your accountant or import into TurboTax.
        </p>
        <p className="text-green-600 text-sm mb-10 max-w-xl">
          Koinly and CoinLedger charge $49–$399/year and still miss pump.fun trades.
          We charge $10. Flat. No subscription.
        </p>
        <a
          href="/tax"
          className="inline-block bg-green-400 text-black font-bold px-8 py-3 hover:bg-green-300 transition-colors"
        >
          Export My Taxes →
        </a>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="border border-green-800 p-6 space-y-3">
          <div className="text-green-500 text-xs tracking-widest uppercase mb-4">
            The problem with existing tools
          </div>
          {[
            "Koinly shows \"Unknown Transaction\" for Jupiter aggregator swaps",
            "CoinLedger misses pump.fun bonding curve buys and sells",
            "Both charge $49–$399/year — for a tool you use once",
            "Your 1099-DA shows proceeds but $0 cost basis for DeFi activity",
          ].map((text) => (
            <div key={text} className="flex gap-3 text-sm">
              <span className="text-red-500 shrink-0">✗</span>
              <span className="text-green-500">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-green-500 text-xs tracking-widest uppercase mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Connect Phantom",
              desc: "Connect your Solana wallet. No email, no signup.",
            },
            {
              step: "02",
              title: "Select tax year",
              desc: "Pick the year you need — 2025, 2024, or earlier.",
            },
            {
              step: "03",
              title: "Pay $10 USDC",
              desc: "One flat fee. No subscription. Balance never expires.",
            },
            {
              step: "04",
              title: "Download CSV",
              desc: "Clean export ready for your accountant or TurboTax.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="border border-green-800 p-4">
              <div className="text-green-600 text-xs mb-3">{step}</div>
              <div className="text-green-300 font-bold mb-2 text-sm">{title}</div>
              <div className="text-green-500 text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-green-500 text-xs tracking-widest uppercase mb-8">
          What&apos;s in the export
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Swaps", desc: "Jupiter, Raydium, Orca, pump.fun" },
            { label: "Transfers", desc: "SOL and SPL token sends/receives" },
            { label: "USD values", desc: "Approximate USD at time of transaction" },
            { label: "Plain English", desc: "AI summary of your trading activity" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-3 border border-green-800 p-4">
              <span className="text-green-400 shrink-0">→</span>
              <div>
                <div className="text-green-300 text-sm font-bold">{label}</div>
                <div className="text-green-500 text-xs">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-green-500 text-xs tracking-widest uppercase mb-8">
          Pricing
        </h2>
        <div className="border border-green-800 p-6 inline-block">
          <div className="text-5xl font-bold text-green-300 mb-1">$10</div>
          <div className="text-green-500 text-sm mb-5">per wallet per year</div>
          <ul className="text-green-500 text-sm space-y-2">
            <li>→ Pay in USDC on Solana</li>
            <li>→ No subscription, no account required</li>
            <li>→ Works for any Solana wallet</li>
            <li>→ Up to 500 transactions per report</li>
          </ul>
          <div className="mt-6">
            <a
              href="/tax"
              className="inline-block bg-green-400 text-black font-bold px-6 py-3 hover:bg-green-300 transition-colors text-sm"
            >
              Export My Taxes →
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-green-700 text-xs border border-green-900 p-4">
          DISCLAIMER: TokenProbe is a data preparation tool, not tax advice.
          USD values are approximate based on daily closing prices. Consult a
          qualified tax professional for final tax calculations and filings.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-800 px-6 py-6 text-center text-green-600 text-xs">
        TokenProbe · Solana tax export · Not tax advice
      </footer>
    </main>
  );
}
