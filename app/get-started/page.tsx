"use client";

import { useState } from "react";

type KeyData = {
  key: string;
  balance_usd: number;
  treasury_wallet: string;
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

  function copy(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
      <nav className="border-b border-[#1f1f2e] px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-1">
          <span className="text-violet-400 font-bold text-lg">Sol</span>
          <span className="text-white font-bold text-lg">Receipt</span>
        </a>
        <span className="text-gray-500 text-xs">Token API · $0.01/call</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-5">

          {step === "connect" && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-2">Get your API key</h1>
                <p className="text-gray-400 text-sm">
                  Connect your Phantom wallet to generate an API key for the token intelligence API.
                  Deposit USDC to start querying at $0.01/call.
                </p>
              </div>
              <button
                onClick={connectWallet}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Connect Phantom Wallet →
              </button>
              <p className="text-gray-600 text-xs text-center">
                No email. No signup. Your wallet is your identity.
              </p>
            </>
          )}

          {step === "loading" && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-gray-400 text-sm">Connecting wallet...</div>
            </div>
          )}

          {step === "done" && keyData && (
            <>
              <div>
                <h1 className="text-2xl font-bold mb-1">Your API key</h1>
                <p className="text-gray-400 text-sm">
                  Balance:{" "}
                  <span className={keyData.balance_usd > 0 ? "text-white" : "text-amber-400"}>
                    ${keyData.balance_usd.toFixed(2)} USDC
                  </span>
                  {keyData.balance_usd === 0 && (
                    <span className="text-amber-400"> — deposit USDC to start querying</span>
                  )}
                </p>
              </div>

              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1f1f2e] text-gray-500 text-xs">api key</div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <code className="text-gray-300 text-sm font-mono flex-1 truncate">{keyData.key}</code>
                  <button
                    onClick={() => copy(keyData.key, setCopied)}
                    className="text-gray-500 hover:text-white text-xs transition-colors shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1f1f2e] text-gray-500 text-xs">
                  deposit usdc to top up
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="text-gray-300 text-xs font-mono flex-1 break-all">
                      {keyData.treasury_wallet}
                    </code>
                    <button
                      onClick={() => copy(keyData.treasury_wallet, setCopiedTreasury)}
                      className="text-gray-500 hover:text-white text-xs transition-colors shrink-0"
                    >
                      {copiedTreasury ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Minimum $5 USDC · $0.01 per call · Balance credited within seconds
                  </p>
                </div>
              </div>

              <div className="bg-[#13131a] border border-[#1f1f2e] rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1f1f2e] text-gray-500 text-xs">quick start</div>
                <pre className="px-4 py-3 text-gray-300 text-xs font-mono overflow-x-auto">{`curl https://tokenprobe.nohall.dev/api/token/{mint} \\
  -H "Authorization: Bearer ${keyData.key}"`}</pre>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {errorMsg}
              </div>
              <button
                onClick={() => { setErrorMsg(""); setStep("connect"); }}
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
