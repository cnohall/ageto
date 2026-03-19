import type { TaxEvent } from "./heliusTax";

const HEADERS = [
  "Date",
  "Type",
  "Token Sold",
  "Amount Sold",
  "Token Received",
  "Amount Received",
  "USD Value (Approx)",
  "SOL Value (Approx)",
  "Transaction ID",
  "Notes",
];

function escape(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(events: TaxEvent[]): string {
  const rows = [HEADERS.join(",")];

  for (const e of events) {
    const row = [
      e.date,
      e.type,
      e.tokenOut || "",
      e.amountOut || "",
      e.tokenIn || "",
      e.amountIn || "",
      e.usdValueApprox !== null ? e.usdValueApprox.toFixed(2) : "N/A",
      e.solValueApprox !== null ? e.solValueApprox.toFixed(6) : "N/A",
      e.signature,
      e.notes,
    ]
      .map(escape)
      .join(",");

    rows.push(row);
  }

  return rows.join("\n");
}

export function generateSummary(events: TaxEvent[], year: number): string {
  const swaps = events.filter((e) => e.type === "SWAP");
  const transfersOut = events.filter((e) => e.type === "TRANSFER_OUT");
  const transfersIn = events.filter((e) => e.type === "TRANSFER_IN");
  const withUsd = events.filter((e) => e.usdValueApprox !== null);
  const totalVolume = withUsd.reduce(
    (s, e) => s + (e.usdValueApprox ?? 0),
    0
  );

  const tokenCounts: Record<string, number> = {};
  for (const e of swaps) {
    if (e.tokenOut) tokenCounts[e.tokenOut] = (tokenCounts[e.tokenOut] ?? 0) + 1;
  }
  const topTokens = Object.entries(tokenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t, c]) => `${t} (${c}x)`)
    .join(", ");

  return [
    `Tax Year: ${year}`,
    `Total taxable events: ${events.length}`,
    `Swaps: ${swaps.length}`,
    `Transfers out: ${transfersOut.length}`,
    `Transfers in: ${transfersIn.length}`,
    `Estimated total volume (where USD value available): $${totalVolume.toFixed(2)}`,
    topTokens ? `Most traded tokens: ${topTokens}` : "",
    `Events with missing USD value: ${events.length - withUsd.length} (price data unavailable for some tokens)`,
    "",
    "DISCLAIMER: USD values are approximate based on daily SOL/USD closing prices.",
    "This export is a data preparation tool only. Consult a qualified tax professional",
    "for final tax calculations and filings.",
  ]
    .filter(Boolean)
    .join("\n");
}
