"use client";

import { useState } from "react";

type KeyData = {
  key: string;
  balance_usd: number;
  treasury_wallet: string;
  deposit_instructions: string;
};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}

export default function GetStarted() {
  const [step, setStep] = useState<"connect" | "loading" | "done" | "error">("connect");
  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTreasury, setCopiedTreasury] = useState(false);

  async function connectWallet() {
    if (!window.solana?.isPhantom) {
      window.open("https://phantom.app", "_blank");
      return;
    }

    setStep("loading");

    try {
      const resp = await window.solana.connect();
      const wallet = resp.publicKey.toString();

      const res = await fetch(`/api/keys?wallet=${wallet}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to get API key");

      setKeyData(data);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  function copyKey() {
    if (!keyData) return;
    navigator.clipboard.writeText(keyData.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyTreasury() {
    if (!keyData) return;
    navigator.clipboard.writeText(keyData.treasury_wallet);
    setCopiedTreasury(true);
    setTimeout(() => setCopiedTreasury(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-green-300 font-mono flex flex-col">
      {/* Nav */}
      <nav className="border-b border-green-800 px-6 py-4">
        <a href="/" className="text-green-300 font-bold text-lg tracking-tight">
          TokenProbe
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6">

          {step === "connect" && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Get your API key</h1>
                <p className="text-green-500 text-sm">
                  Connect your Phantom wallet to generate an API key. Then deposit USDC to start querying.
                </p>
              </div>
              <button
                onClick={connectWallet}
                className="w-full border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors font-bold text-green-300"
              >
                Connect Phantom Wallet →
              </button>
              <p className="text-green-600 text-xs">
                No email. No signup. Your wallet address is your identity.
              </p>
            </>
          )}

          {step === "loading" && (
            <div className="text-center py-8">
              <div className="text-green-500 text-sm animate-pulse">
                Connecting wallet...
              </div>
            </div>
          )}

          {step === "done" && keyData && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Your API key</h1>
                <p className="text-green-500 text-sm">
                  Balance:{" "}
                  <span className="text-green-300">${keyData.balance_usd.toFixed(2)} USD</span>
                  {keyData.balance_usd === 0 && (
                    <span className="text-yellow-500"> — deposit USDC below to start querying</span>
                  )}
                </p>
              </div>

              {/* API Key */}
              <div className="border border-green-800">
                <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
                  api key
                </div>
                <div className="flex items-center justify-between px-4 py-3 gap-4">
                  <code className="text-green-300 text-sm truncate">{keyData.key}</code>
                  <button
                    onClick={copyKey}
                    className="text-green-500 hover:text-green-300 text-xs whitespace-nowrap transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Deposit instructions */}
              <div className="border border-green-800">
                <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
                  deposit usdc to top up
                </div>
                <div className="px-4 py-3 space-y-3">
                  <p className="text-green-500 text-xs">
                    Send USDC (SPL token) on Solana to:
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-green-300 text-xs break-all">
                      {keyData.treasury_wallet}
                    </code>
                    <button
                      onClick={copyTreasury}
                      className="text-green-500 hover:text-green-300 text-xs whitespace-nowrap transition-colors"
                    >
                      {copiedTreasury ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-green-600 text-xs">
                    Minimum $5 USDC · $0.01 per API call · Balance credited within seconds
                  </p>
                </div>
              </div>

              {/* Quick start */}
              <div className="border border-green-800">
                <div className="border-b border-green-800 px-4 py-2 text-green-500 text-xs">
                  quick start
                </div>
                <pre className="px-4 py-3 text-green-300 text-xs overflow-x-auto">{`curl https://tokenprobe.nohall.dev/api/token/{mint} \\
  -H "Authorization: Bearer ${keyData.key}"`}</pre>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <div className="text-red-400 text-sm border border-red-900 px-4 py-3">
                {errorMsg}
              </div>
              <button
                onClick={() => setStep("connect")}
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
