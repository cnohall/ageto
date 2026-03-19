"use client";

import { useState } from "react";

type Step = "connect" | "form" | "processing" | "done" | "error";

type ReportResult = {
  report_id: string;
  transaction_count: number;
  summary: string;
  csv_data: string;
};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}

export default function TaxPage() {
  const [step, setStep] = useState<Step>("connect");
  const [wallet, setWallet] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState("");
  const [treasuryWallet, setTreasuryWallet] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  async function connectWallet() {
    if (!window.solana?.isPhantom) {
      window.open("https://phantom.app", "_blank");
      return;
    }
    try {
      const resp = await window.solana.connect();
      const w = resp.publicKey.toString();
      setWallet(w);
      const res = await fetch(`/api/keys?wallet=${w}`);
      const data = await res.json();
      setApiKey(data.key);
      setBalance(data.balance_usd ?? 0);
      setTreasuryWallet(data.treasury_wallet ?? "");
      setStep("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      setStep("error");
    }
  }

  function enterDemoMode() {
    setIsDemo(true);
    setWallet(process.env.NEXT_PUBLIC_DEMO_WALLET ?? "Demo wallet");
    setBalance(10);
    setApiKey(process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "");
    setStep("form");
  }

  async function generateReport() {
    if (!isDemo && balance < 10) {
      setError(`Insufficient balance ($${balance.toFixed(2)}). You need $10.00 USDC.`);
      setStep("error");
      return;
    }
    setStep("processing");
    try {
      const authKey = isDemo
        ? process.env.NEXT_PUBLIC_DEMO_API_KEY
        : apiKey;
      const res = await fetch("/api/tax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({ wallet, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Report generation failed");
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  function downloadCsv() {
    if (!result?.csv_data) return;
    const blob = new Blob([result.csv_data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solreceipt-${year}-${wallet.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="min-h-screen bg-[#0d0d12] text-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-[#1f1f2e] px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-1">
          <span className="text-violet-400 font-bold text-lg">Sol</span>
          <span className="text-white font-bold text-lg">Receipt</span>
        </a>
        <span className="text-gray-500 text-xs">Solana Tax Export · $10/wallet</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-5">

          {/* Connect */}
          {step === "connect" && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Export your Solana taxes</h1>
                <p className="text-gray-400 text-sm">
                  Connect your Phantom wallet to get started. $10 USDC per wallet per year.
                </p>
              </div>

              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-5 space-y-2 text-sm">
                <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3">What you get</div>
                {[
                  "All swaps — Jupiter, Raydium, pump.fun",
                  "Transfers in and out",
                  "USD value at time of transaction",
                  "CSV ready for TurboTax or your accountant",
                ].map((t) => (
                  <div key={t} className="flex gap-2 text-gray-400">
                    <span className="text-violet-400 shrink-0">→</span>
                    {t}
                  </div>
                ))}
              </div>

              <button
                onClick={connectWallet}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Connect Phantom Wallet →
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-[#1f1f2e]" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 border-t border-[#1f1f2e]" />
              </div>

              <button
                onClick={enterDemoMode}
                className="w-full border border-[#1f1f2e] hover:border-violet-500/50 text-gray-400 hover:text-white font-medium py-3 rounded-md transition-colors text-sm"
              >
                Try Demo — no wallet needed
              </button>

              <p className="text-gray-600 text-xs text-center">
                No email. No signup. Your wallet is your identity.
              </p>
            </>
          )}

          {/* Form */}
          {step === "form" && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">Generate Tax Report</h1>
                  {isDemo && (
                    <span className="text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded">
                      DEMO
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm font-mono">
                  {wallet.slice(0, 8)}...{wallet.slice(-8)}
                </p>
              </div>

              {/* Balance */}
              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Balance</span>
                  <span className={`text-sm font-semibold ${balance >= 10 ? "text-white" : "text-amber-400"}`}>
                    ${balance.toFixed(2)} USDC
                  </span>
                </div>
                {balance < 10 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-amber-400 text-xs">
                      You need $10.00 to generate a report. Send USDC to:
                    </p>
                    <div className="flex items-center gap-2 bg-[#0d0d12] border border-[#2a2a3a] rounded px-3 py-2">
                      <code className="text-gray-300 text-xs flex-1 truncate font-mono">
                        {treasuryWallet}
                      </code>
                      <button
                        onClick={() => copyToClipboard(treasuryWallet)}
                        className="text-gray-500 hover:text-white text-xs transition-colors shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs">
                      Balance updates automatically within seconds of receiving USDC.
                    </p>
                  </div>
                )}
              </div>

              {/* Year selector */}
              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-4">
                <label className="text-gray-500 text-xs uppercase tracking-wide block mb-3">
                  Tax Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#0d0d12] text-white border border-[#2a2a3a] rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  {[2025, 2024, 2023, 2022].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateReport}
                disabled={balance < 10}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:text-violet-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors"
              >
                Generate Report — $10.00 →
              </button>

              <p className="text-gray-600 text-xs text-center">
                Processing takes 30–90 seconds. Do not close this tab.
              </p>
            </>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-white font-semibold">Analyzing your wallet...</div>
              <div className="text-gray-500 text-sm">
                Fetching transactions and looking up historical prices.
                <br />
                This takes 30–90 seconds.
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && result && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                  ✓
                </div>
                <div>
                  <h1 className="text-xl font-bold">Report Ready</h1>
                  <p className="text-gray-400 text-sm">
                    {result.transaction_count} taxable events found for {year}
                  </p>
                </div>
              </div>

              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg p-4">
                <div className="text-gray-500 text-xs uppercase tracking-wide mb-3">Summary</div>
                <pre className="text-gray-300 text-xs whitespace-pre-wrap leading-relaxed font-mono">
                  {result.summary}
                </pre>
              </div>

              <button
                onClick={downloadCsv}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Download CSV →
              </button>

              <p className="text-gray-600 text-xs text-center">
                Import into CoinLedger, Koinly, TurboTax, or send to your accountant.
              </p>

              <p className="text-gray-600 text-xs border border-[#1f1f2e] rounded p-3">
                USD values are approximate. This is a data preparation tool, not tax advice.
                Consult a qualified tax professional.
              </p>
            </>
          )}

          {/* Error */}
          {step === "error" && (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
              <button
                onClick={() => { setError(""); setStep(wallet ? "form" : "connect"); }}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Try again
              </button>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
