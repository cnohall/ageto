// Fetches historical SOL/USD prices from CoinGecko
// Uses a single range call for the full year instead of one call per day

import type { TaxEvent } from "./heliusTax";

type PriceCache = Record<string, number>; // YYYY-MM-DD → USD price

export async function buildPriceCache(year: number): Promise<PriceCache> {
  const from = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
  const to = Math.floor(new Date(`${year + 1}-01-01`).getTime() / 1000);

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/market_chart/range?vs_currency=usd&from=${from}&to=${to}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) return {};

    const data: { prices: [number, number][] } = await res.json();
    const cache: PriceCache = {};

    for (const [unixMs, price] of data.prices) {
      const date = new Date(unixMs).toISOString().split("T")[0];
      cache[date] = price;
    }

    return cache;
  } catch {
    return {}; // non-fatal — events will just have null USD values
  }
}

export function applyPrices(
  events: TaxEvent[],
  priceCache: PriceCache
): TaxEvent[] {
  return events.map((event) => {
    if (event.usdValueApprox !== null) return event; // stablecoins already set

    const solPrice = priceCache[event.date];
    if (!solPrice || event.solValueApprox === null) return event;

    return {
      ...event,
      usdValueApprox: parseFloat((event.solValueApprox * solPrice).toFixed(2)),
    };
  });
}
