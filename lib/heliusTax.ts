// Fetches and parses Solana transactions for tax reporting
// Uses Helius Enhanced Transactions API

const HELIUS_API_KEY = () => process.env.HELIUS_API_KEY!;
const BASE_URL = () =>
  `https://api.helius.xyz/v0/addresses`;

export type TaxEvent = {
  signature: string;
  timestamp: number; // unix seconds
  date: string; // YYYY-MM-DD
  type: "SWAP" | "TRANSFER_OUT" | "TRANSFER_IN" | "AIRDROP" | "OTHER";
  tokenIn: string; // token symbol or mint
  amountIn: number;
  tokenOut: string;
  amountOut: number;
  solValueApprox: number | null; // SOL equivalent at time of tx
  usdValueApprox: number | null; // filled in by price lookup
  notes: string;
};

type HeliusTokenTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  fromTokenAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard?: string;
};

type HeliusNativeTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number; // lamports
};

type HeliusTransaction = {
  signature: string;
  timestamp: number;
  type: string;
  tokenTransfers: HeliusTokenTransfer[];
  nativeTransfers: HeliusNativeTransfer[];
  fee: number;
  feePayer: string;
  description?: string;
};

const LAMPORTS = 1_000_000_000;
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

function toDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().split("T")[0];
}

function mintLabel(mint: string): string {
  if (mint === SOL_MINT) return "SOL";
  if (mint === USDC_MINT) return "USDC";
  if (mint === USDT_MINT) return "USDT";
  return mint.slice(0, 8) + "..."; // shorten unknown mints
}

function parseSwap(tx: HeliusTransaction, wallet: string): TaxEvent | null {
  const transfers = tx.tokenTransfers ?? [];
  const native = tx.nativeTransfers ?? [];

  // Tokens leaving wallet
  const outgoing = transfers.filter((t) => t.fromUserAccount === wallet);
  // Tokens entering wallet
  const incoming = transfers.filter((t) => t.toUserAccount === wallet);

  // SOL leaving wallet (native)
  const solOut = native
    .filter((t) => t.fromUserAccount === wallet)
    .reduce((s, t) => s + t.amount, 0) / LAMPORTS;

  // SOL entering wallet (native)
  const solIn = native
    .filter((t) => t.toUserAccount === wallet)
    .reduce((s, t) => s + t.amount, 0) / LAMPORTS;

  const tokenOut = outgoing[0];
  const tokenIn = incoming[0];

  // Determine what was sold and what was received
  let soldToken = "SOL";
  let soldAmount = solOut;
  let boughtToken = "SOL";
  let boughtAmount = solIn;
  let solEquiv: number | null = null;

  if (tokenOut && !tokenIn) {
    // Token → SOL
    soldToken = mintLabel(tokenOut.mint);
    soldAmount = tokenOut.tokenAmount;
    boughtToken = "SOL";
    boughtAmount = solIn;
    solEquiv = solIn;
  } else if (!tokenOut && tokenIn) {
    // SOL → Token
    soldToken = "SOL";
    soldAmount = solOut;
    boughtToken = mintLabel(tokenIn.mint);
    boughtAmount = tokenIn.tokenAmount;
    solEquiv = solOut;
  } else if (tokenOut && tokenIn) {
    // Token → Token
    soldToken = mintLabel(tokenOut.mint);
    soldAmount = tokenOut.tokenAmount;
    boughtToken = mintLabel(tokenIn.mint);
    boughtAmount = tokenIn.tokenAmount;
  } else if (solOut > 0 && solIn === 0) {
    // Pure SOL out
    soldToken = "SOL";
    soldAmount = solOut;
    boughtToken = "?";
    boughtAmount = 0;
    solEquiv = solOut;
  }

  return {
    signature: tx.signature,
    timestamp: tx.timestamp,
    date: toDate(tx.timestamp),
    type: "SWAP",
    tokenIn: boughtToken,
    amountIn: boughtAmount,
    tokenOut: soldToken,
    amountOut: soldAmount,
    solValueApprox: solEquiv,
    usdValueApprox: null,
    notes: tx.description ?? "",
  };
}

function parseTransfer(tx: HeliusTransaction, wallet: string): TaxEvent | null {
  const transfers = tx.tokenTransfers ?? [];
  const native = tx.nativeTransfers ?? [];

  const outgoing = transfers.find((t) => t.fromUserAccount === wallet);
  const incoming = transfers.find((t) => t.toUserAccount === wallet);
  const solOut = native
    .filter((t) => t.fromUserAccount === wallet)
    .reduce((s, t) => s + t.amount, 0) / LAMPORTS;
  const solIn = native
    .filter((t) => t.toUserAccount === wallet)
    .reduce((s, t) => s + t.amount, 0) / LAMPORTS;

  if (outgoing) {
    return {
      signature: tx.signature,
      timestamp: tx.timestamp,
      date: toDate(tx.timestamp),
      type: "TRANSFER_OUT",
      tokenIn: "",
      amountIn: 0,
      tokenOut: mintLabel(outgoing.mint),
      amountOut: outgoing.tokenAmount,
      solValueApprox: null,
      usdValueApprox:
        outgoing.mint === USDC_MINT || outgoing.mint === USDT_MINT
          ? outgoing.tokenAmount
          : null,
      notes: `To: ${outgoing.toUserAccount.slice(0, 8)}...`,
    };
  }

  if (incoming) {
    const isStablecoin =
      incoming.mint === USDC_MINT || incoming.mint === USDT_MINT;
    return {
      signature: tx.signature,
      timestamp: tx.timestamp,
      date: toDate(tx.timestamp),
      type: "TRANSFER_IN",
      tokenIn: mintLabel(incoming.mint),
      amountIn: incoming.tokenAmount,
      tokenOut: "",
      amountOut: 0,
      solValueApprox: null,
      usdValueApprox: isStablecoin ? incoming.tokenAmount : null,
      notes: `From: ${incoming.fromUserAccount.slice(0, 8)}...`,
    };
  }

  if (solOut > 0) {
    return {
      signature: tx.signature,
      timestamp: tx.timestamp,
      date: toDate(tx.timestamp),
      type: "TRANSFER_OUT",
      tokenIn: "",
      amountIn: 0,
      tokenOut: "SOL",
      amountOut: solOut,
      solValueApprox: solOut,
      usdValueApprox: null,
      notes: "",
    };
  }

  if (solIn > 0) {
    return {
      signature: tx.signature,
      timestamp: tx.timestamp,
      date: toDate(tx.timestamp),
      type: "TRANSFER_IN",
      tokenIn: "SOL",
      amountIn: solIn,
      tokenOut: "",
      amountOut: 0,
      solValueApprox: solIn,
      usdValueApprox: null,
      notes: "",
    };
  }

  return null;
}

export async function fetchTaxTransactions(
  wallet: string,
  year: number
): Promise<TaxEvent[]> {
  const yearStart = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
  const yearEnd = Math.floor(new Date(`${year + 1}-01-01`).getTime() / 1000);

  const events: TaxEvent[] = [];
  let before: string | undefined = undefined;
  let keepFetching = true;

  while (keepFetching) {
    const params = new URLSearchParams({
      "api-key": HELIUS_API_KEY(),
      limit: "100",
      ...(before ? { before } : {}),
    });

    const url = `${BASE_URL()}/${wallet}/transactions?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Helius API error: ${res.status} ${await res.text()}`);
    }

    const txs: HeliusTransaction[] = await res.json();

    if (!txs || txs.length === 0) break;

    for (const tx of txs) {
      // Stop if we've gone past the start of the year
      if (tx.timestamp < yearStart) {
        keepFetching = false;
        break;
      }

      // Skip transactions after the year
      if (tx.timestamp >= yearEnd) continue;

      let event: TaxEvent | null = null;

      if (tx.type === "SWAP") {
        event = parseSwap(tx, wallet);
      } else if (tx.type === "TRANSFER") {
        event = parseTransfer(tx, wallet);
      }

      if (event) events.push(event);
    }

    // Pagination: use last signature as cursor
    if (txs.length < 100 || !keepFetching) break;
    before = txs[txs.length - 1].signature;

    // Safety limit: max 500 events per request
    if (events.length >= 500) break;
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}
