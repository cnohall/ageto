import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokenProbe — Solana Token Intelligence for AI Agents",
  description:
    "One API call returns price, volume, liquidity, and on-chain holder data for any Solana token. Pay $0.01 per query in USDC. No subscriptions.",
  openGraph: {
    title: "TokenProbe — Solana Token Intelligence for AI Agents",
    description:
      "One API call. Every metric your trading agent needs. Pay per query in USDC. No subscriptions.",
    url: "https://tokenprobe.nohall.dev",
    siteName: "TokenProbe",
    images: [
      {
        url: "https://tokenprobe.nohall.dev/og.png",
        width: 1200,
        height: 630,
        alt: "TokenProbe — Solana Token Intelligence for AI Agents",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenProbe — Solana Token Intelligence for AI Agents",
    description:
      "One API call. Every metric your trading agent needs. Pay per query in USDC. No subscriptions.",
    images: ["https://tokenprobe.nohall.dev/og.png"],
  },
};

const EXAMPLE_RESPONSE = `{
  "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "symbol": "Bonk",
  "price_usd": 0.000006118,
  "price_change_24h_pct": -9.65,
  "volume_24h_usd": 9021.63,
  "liquidity_usd": 877275.75,
  "market_cap_usd": 543711596,
  "top_10_holders_pct": 32.14,
  "timestamp": "2026-03-19T05:29:43.531Z"
}`;

const CURL_EXAMPLE = `curl https://tokenprobe.nohall.dev/api/token/{mint} \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const PYTHON_EXAMPLE = `import requests

res = requests.get(
    "https://tokenprobe.nohall.dev/api/token/{mint}",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
print(res.json())`;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-green-300 font-mono">
      {/* Nav */}
      <nav className="border-b border-green-800 px-6 py-4 flex items-center justify-between">
        <span className="text-green-300 font-bold text-lg tracking-tight">
          TokenProbe
        </span>
        <div className="flex items-center gap-6 text-sm text-green-500">
          <a href="#pricing" className="hover:text-green-300 transition-colors">
            Pricing
          </a>
          <a href="#docs" className="hover:text-green-300 transition-colors">
            Docs
          </a>
          <a
            href="/get-started"
            className="border border-green-600 px-3 py-1 hover:border-green-300 hover:text-green-300 transition-colors"
          >
            Get API Key →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-green-500 text-sm mb-4 tracking-widest uppercase">
          Solana · AI Agents · Pay per query
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-green-300 leading-tight mb-6">
          Token intelligence
          <br />
          for autonomous agents.
        </h1>
        <p className="text-green-500 text-lg mb-10 max-w-xl">
          One endpoint returns price, volume, liquidity, and on-chain holder
          concentration for any Solana token. No API keys to manage — deposit
          USDC once, query forever.
        </p>
        <a
          href="/get-started"
          className="inline-block bg-green-400 text-black font-bold px-6 py-3 hover:bg-green-300 transition-colors"
        >
          Get API Key →
        </a>
      </section>

      {/* Example response */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="border border-green-800 rounded">
          <div className="border-b border-green-800 px-4 py-2 flex items-center gap-2">
            <span className="text-green-500 text-xs">GET</span>
            <span className="text-green-300 text-xs">
              /api/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
            </span>
          </div>
          <pre className="p-4 text-sm text-green-300 overflow-x-auto">
            {EXAMPLE_RESPONSE}
          </pre>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-green-500 text-xs tracking-widest uppercase mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Deposit USDC",
              desc: "Send any amount of USDC to the treasury wallet. Your balance is credited instantly.",
            },
            {
              step: "02",
              title: "Get your API key",
              desc: "Connect your Phantom wallet and copy your unique API key. No email, no signup.",
            },
            {
              step: "03",
              title: "Query from your agent",
              desc: "Call the endpoint from any language. $0.01 is deducted per call. Top up when needed.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="border border-green-800 p-5">
              <div className="text-green-600 text-xs mb-3">{step}</div>
              <div className="text-green-300 font-bold mb-2">{title}</div>
              <div className="text-green-500 text-sm">{desc}</div>
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
          <div className="text-4xl font-bold text-green-300 mb-1">$0.01</div>
          <div className="text-green-500 text-sm mb-4">per API call</div>
          <ul className="text-green-500 text-sm space-y-2">
            <li>→ $5 minimum top-up (500 calls)</li>
            <li>→ Pay in USDC on Solana</li>
            <li>→ No subscription, no expiry</li>
            <li>→ Balance never expires</li>
          </ul>
        </div>
      </section>

      {/* Code examples */}
      <section id="docs" className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-green-500 text-xs tracking-widest uppercase mb-8">
          Quick start
        </h2>
        <div className="space-y-4">
          <div className="border border-green-800 rounded">
            <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
              curl
            </div>
            <pre className="p-4 text-sm text-green-300 overflow-x-auto">
              {CURL_EXAMPLE}
            </pre>
          </div>
          <div className="border border-green-800 rounded">
            <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
              python
            </div>
            <pre className="p-4 text-sm text-green-300 overflow-x-auto">
              {PYTHON_EXAMPLE}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-800 px-6 py-6 text-center text-green-600 text-xs">
        TokenProbe · Solana token intelligence for AI agents
      </footer>
    </main>
  );
}
