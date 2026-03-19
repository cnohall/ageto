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
  const [progress, setProgress] = useState("");

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
      setStep("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      setStep("error");
    }
  }

  async function generateReport() {
    if (balance < 10) {
      setError(
        `Insufficient balance ($${balance.toFixed(2)}). You need $10.00 USDC. Top up at /get-started.`
      );
      setStep("error");
      return;
    }

    setStep("processing");
    setProgress("Fetching your transactions from Solana...");

    try {
      const res = await fetch("/api/tax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ wallet, year }),
      });

      setProgress("Processing transactions and looking up prices...");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Report generation failed");
      }

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
    a.download = `solana-taxes-${year}-${wallet.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-green-300 font-mono flex flex-col">
      <nav className="border-b border-green-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-green-300 font-bold text-lg tracking-tight">
          TokenProbe
        </a>
        <span className="text-green-600 text-xs">Solana Tax Export</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6">

          {/* Connect */}
          {step === "connect" && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Solana Tax Export</h1>
                <p className="text-green-500 text-sm mb-1">
                  Get a clean CSV of all your Solana taxable events — swaps, transfers, and airdrops — with USD values.
                </p>
                <p className="text-green-600 text-xs">
                  $10 per wallet per year · No subscription · Works with Jupiter, pump.fun, Raydium
                </p>
              </div>
              <button
                onClick={connectWallet}
                className="w-full border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors font-bold text-green-300"
              >
                Connect Phantom Wallet →
              </button>
              <div className="border border-green-800 p-4 text-green-600 text-xs space-y-1">
                <div className="text-green-500 font-bold mb-2">What you get:</div>
                <div>→ All swaps (Jupiter, Raydium, pump.fun)</div>
                <div>→ Token transfers in and out</div>
                <div>→ Approximate USD value at time of transaction</div>
                <div>→ CSV ready for your accountant or TurboTax</div>
              </div>
              <p className="text-green-700 text-xs">
                DISCLAIMER: This is a data preparation tool, not tax advice.
                USD values are approximate. Consult a tax professional for filing.
              </p>
            </>
          )}

          {/* Form */}
          {step === "form" && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-1">Generate Tax Report</h1>
                <p className="text-green-500 text-sm">
                  Wallet:{" "}
                  <span className="text-green-300">
                    {wallet.slice(0, 8)}...{wallet.slice(-8)}
                  </span>
                </p>
                <p className="text-green-500 text-sm">
                  Balance:{" "}
                  <span className={balance >= 10 ? "text-green-300" : "text-yellow-500"}>
                    ${balance.toFixed(2)} USD
                  </span>
                  {balance < 10 && (
                    <span className="text-yellow-500">
                      {" "}— need $10.00 to generate report.{" "}
                      <a href="/get-started" className="underline">
                        Top up →
                      </a>
                    </span>
                  )}
                </p>
              </div>

              <div className="border border-green-800">
                <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
                  tax year
                </div>
                <div className="px-4 py-3">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-transparent text-green-300 border border-green-700 px-3 py-1 text-sm w-full focus:outline-none focus:border-green-400"
                  >
                    {[2025, 2024, 2023, 2022].map((y) => (
                      <option key={y} value={y} className="bg-black">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={generateReport}
                disabled={balance < 10}
                className="w-full border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors font-bold text-green-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Report — $10.00 →
              </button>
              <p className="text-green-700 text-xs">
                $10 will be deducted from your balance. Processing takes 30–120 seconds depending on transaction volume.
              </p>
            </>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="text-center py-8 space-y-4">
              <div className="text-green-400 text-lg font-bold animate-pulse">
                Processing...
              </div>
              <div className="text-green-500 text-sm">{progress}</div>
              <div className="text-green-700 text-xs">
                This can take 1–2 minutes for wallets with many transactions.
                <br />
                Do not close this tab.
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && result && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2 text-green-300">
                  Report Ready
                </h1>
                <p className="text-green-500 text-sm">
                  {result.transaction_count} taxable events found for {year}.
                </p>
              </div>

              <div className="border border-green-800">
                <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
                  summary
                </div>
                <pre className="px-4 py-3 text-green-300 text-xs whitespace-pre-wrap">
                  {result.summary}
                </pre>
              </div>

              <button
                onClick={downloadCsv}
                className="w-full bg-green-400 text-black px-6 py-3 hover:bg-green-300 transition-colors font-bold"
              >
                Download CSV →
              </button>

              <p className="text-green-700 text-xs">
                Import this CSV into CoinLedger, Koinly, or TurboTax — or hand
                it directly to your accountant.
              </p>
            </>
          )}

          {/* Error */}
          {step === "error" && (
            <>
              <div className="border border-red-900 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
              <button
                onClick={() => {
                  setError("");
                  setStep(wallet ? "form" : "connect");
                }}
                className="text-green-500 hover:text-green-300 text-sm transition-colors"
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
