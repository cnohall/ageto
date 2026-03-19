const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export type TokenData = {
  mint: string;
  symbol: string;
  name: string;
  price_usd: number;
  price_change_24h_pct: number;
  volume_24h_usd: number;
  liquidity_usd: number;
  market_cap_usd: number;
  top_10_holders_pct: number | null;
  timestamp: string;
};

// --- DexScreener ---

type DexScreenerResponse = {
  pairs: Array<{
    baseToken: { address: string; symbol: string; name: string };
    priceUsd: string;
    priceChange: { h24: number };
    volume: { h24: number };
    liquidity: { usd: number };
    fdv: number;
  }>;
};

async function fetchDexScreener(mint: string) {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
    { next: { revalidate: 0 } } // always fresh
  );
  if (!res.ok) throw new Error(`DexScreener error: ${res.status}`);
  const json: DexScreenerResponse = await res.json();

  if (!json.pairs || json.pairs.length === 0) {
    throw new Error("Token not found on DexScreener");
  }

  // Use the pair with highest liquidity as the canonical source
  const pair = json.pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  return {
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    price_usd: parseFloat(pair.priceUsd ?? "0"),
    price_change_24h_pct: pair.priceChange?.h24 ?? 0,
    volume_24h_usd: pair.volume?.h24 ?? 0,
    liquidity_usd: pair.liquidity?.usd ?? 0,
    market_cap_usd: pair.fdv ?? 0,
  };
}

// --- Helius (top holder concentration) ---

async function heliusRpc(method: string, params: unknown[]) {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Helius RPC error: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`Helius RPC: ${json.error.message}`);
  return json.result;
}

async function fetchTopHolderPct(mint: string): Promise<number | null> {
  try {
    const [largestAccounts, supplyResult] = await Promise.all([
      heliusRpc("getTokenLargestAccounts", [mint]),
      heliusRpc("getTokenSupply", [mint]),
    ]);

    const totalSupply = parseFloat(supplyResult.value.amount);
    if (!totalSupply) return null;

    const top10 = largestAccounts.value.slice(0, 10) as Array<{ amount: string }>;
    const top10Total = top10.reduce((sum, a) => sum + parseFloat(a.amount), 0);

    return parseFloat(((top10Total / totalSupply) * 100).toFixed(2));
  } catch {
    return null; // non-fatal — return null if Helius call fails
  }
}

// --- Aggregator ---

export async function getTokenData(mint: string): Promise<TokenData> {
  const [dex, top10Pct] = await Promise.all([
    fetchDexScreener(mint),
    fetchTopHolderPct(mint),
  ]);

  return {
    mint,
    ...dex,
    top_10_holders_pct: top10Pct,
    timestamp: new Date().toISOString(),
  };
}
