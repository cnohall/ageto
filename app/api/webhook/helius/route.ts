import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

// USDC mint address on Solana mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = 6;

type TokenTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
};

type HeliusTransaction = {
  signature: string;
  events?: {
    tokenTransfers?: TokenTransfer[];
  };
};

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== process.env.HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: HeliusTransaction[] = await req.json();
  const treasury = process.env.TREASURY_WALLET;
  const supabase = createClient();

  for (const tx of body) {
    const transfers = tx.events?.tokenTransfers ?? [];

    for (const transfer of transfers) {
      // Only process USDC transfers to the treasury wallet
      if (
        transfer.mint !== USDC_MINT ||
        transfer.toUserAccount !== treasury
      ) {
        continue;
      }

      const amountUsd = transfer.tokenAmount / Math.pow(10, USDC_DECIMALS);
      const senderWallet = transfer.fromUserAccount;
      const signature = tx.signature;

      // Skip if we've already processed this transaction
      const { data: existing } = await supabase
        .from("topups")
        .select("id")
        .eq("tx_signature", signature)
        .single();

      if (existing) continue;

      // Find or create API key for this wallet
      let { data: keyRow } = await supabase
        .from("api_keys")
        .select("*")
        .eq("wallet_address", senderWallet)
        .single();

      if (!keyRow) {
        const { data: newKey } = await supabase
          .from("api_keys")
          .insert({
            key: randomUUID(),
            wallet_address: senderWallet,
            balance_usd: 0,
          })
          .select()
          .single();
        keyRow = newKey;
      }

      if (!keyRow) continue;

      // Credit balance and record top-up atomically
      await Promise.all([
        supabase
          .from("api_keys")
          .update({ balance_usd: keyRow.balance_usd + amountUsd })
          .eq("id", keyRow.id),
        supabase.from("topups").insert({
          api_key_id: keyRow.id,
          amount_usdc: amountUsd,
          tx_signature: signature,
        }),
      ]);

      console.log(
        `Credited $${amountUsd} to wallet ${senderWallet} (key: ${keyRow.key})`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
