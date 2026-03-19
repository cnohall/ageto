import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SolReceipt — Solana Tax Export",
  description:
    "Fix your Solana taxes for $10. Clean CSV of every swap, transfer, and airdrop — Jupiter, pump.fun, Raydium. No subscription.",
  openGraph: {
    title: "SolReceipt — Solana Tax Export",
    description:
      "Fix your Solana taxes for $10. Clean CSV of every swap, transfer, and airdrop. No subscription.",
    url: "https://tokenprobe.nohall.dev",
    siteName: "SolReceipt",
    images: [{ url: "https://tokenprobe.nohall.dev/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolReceipt — Solana Tax Export",
    description: "Fix your Solana taxes for $10. No subscription.",
    images: ["https://tokenprobe.nohall.dev/og.png"],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0d12] text-white">

      {/* Nav */}
      <nav className="border-b border-[#1f1f2e] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-bold text-xl">Sol</span>
          <span className="text-white font-bold text-xl">Receipt</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a
            href="/tax"
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md transition-colors font-medium"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          US Tax Deadline: April 15 · 27 days away
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Fix your Solana taxes
          <br />
          <span className="text-violet-400">for $10.</span>
        </h1>
        <p className="text-gray-400 text-xl mb-4 max-w-2xl mx-auto">
          Clean CSV export of every swap, transfer, and airdrop from your Solana wallet.
          Works with Jupiter, pump.fun, and Raydium.
        </p>
        <p className="text-gray-500 text-sm mb-10">
          Koinly charges $49–$399/year and still misses pump.fun trades. We charge $10. Flat.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/tax"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-md transition-colors text-lg"
          >
            Export My Taxes →
          </a>
          <a href="#how" className="text-gray-400 hover:text-white transition-colors text-sm">
            See how it works ↓
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-6">
            <div className="text-red-400 text-xs font-medium uppercase tracking-wide mb-4">
              The problem
            </div>
            <ul className="space-y-3">
              {[
                "Koinly shows \"Unknown Transaction\" for Jupiter swaps",
                "CoinLedger misses pump.fun bonding curve trades",
                "Your 1099-DA shows $0 cost basis for DeFi activity",
                "Existing tools charge $399/year for the privilege",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-gray-400">
                  <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#13131a] border border-violet-500/30 rounded-lg p-6">
            <div className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-4">
              SolReceipt
            </div>
            <ul className="space-y-3">
              {[
                "Parses Jupiter, Raydium, Orca, and pump.fun correctly",
                "Includes USD value at time of each transaction",
                "Ready to import into TurboTax or hand to your accountant",
                "$10 flat. No subscription. No account required.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-gray-400">
                  <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Connect Phantom", desc: "Connect your Solana wallet. No email, no signup." },
            { step: "02", title: "Select year", desc: "Pick 2025, 2024, or earlier." },
            { step: "03", title: "Pay $10 USDC", desc: "One flat fee. Balance never expires." },
            { step: "04", title: "Download CSV", desc: "Import into TurboTax or send to your accountant." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-5">
              <div className="text-violet-500 text-xs font-mono mb-3">{step}</div>
              <div className="text-white font-semibold mb-2 text-sm">{title}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-8">
          What&apos;s in the export
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: "Swaps", desc: "Jupiter, Raydium, Orca, pump.fun bonding curves" },
            { label: "Transfers", desc: "SOL and SPL token sends and receives" },
            { label: "USD values", desc: "Approximate USD at time of transaction using daily SOL price" },
            { label: "Plain English summary", desc: "AI-generated overview of your trading activity" },
            { label: "Transaction IDs", desc: "Every row links to the original on-chain transaction" },
            { label: "CSV format", desc: "Compatible with TurboTax, CoinLedger, Koinly, and Excel" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-4 bg-[#13131a] border border-[#1f1f2e] rounded-lg p-4">
              <span className="text-violet-400 shrink-0 mt-0.5 text-sm">→</span>
              <div>
                <div className="text-white text-sm font-medium">{label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-8">
          Pricing
        </h2>
        <div className="bg-[#13131a] border border-violet-500/30 rounded-lg p-8 max-w-sm">
          <div className="text-6xl font-bold text-white mb-1">$10</div>
          <div className="text-gray-400 text-sm mb-6">per wallet, per tax year</div>
          <ul className="text-gray-400 text-sm space-y-2 mb-8">
            <li className="flex gap-2"><span className="text-violet-400">✓</span> Pay in USDC on Solana</li>
            <li className="flex gap-2"><span className="text-violet-400">✓</span> No subscription or account</li>
            <li className="flex gap-2"><span className="text-violet-400">✓</span> Up to 500 transactions</li>
            <li className="flex gap-2"><span className="text-violet-400">✓</span> Balance never expires</li>
          </ul>
          <a
            href="/tax"
            className="block text-center bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            Get Started →
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-gray-600 text-xs border border-[#1f1f2e] rounded-lg p-4">
          SolReceipt is a data preparation tool, not tax advice. USD values are approximate
          based on daily closing prices. Consult a qualified tax professional for final
          tax calculations and filings.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f1f2e] px-6 py-6 text-center text-gray-600 text-xs">
        SolReceipt · Solana tax export · Not tax advice
      </footer>
    </main>
  );
}
