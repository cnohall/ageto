import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

// GET /api/keys?wallet=<address>
// Returns the API key and balance for a wallet. Creates one if it doesn't exist.
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
  }

  // Basic Solana address validation (base58, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const supabase = createClient();

  // Find existing key
  let { data: keyRow } = await supabase
    .from("api_keys")
    .select("key, balance_usd, created_at")
    .eq("wallet_address", wallet)
    .single();

  // Create one if it doesn't exist yet
  if (!keyRow) {
    const { data: newKey, error } = await supabase
      .from("api_keys")
      .insert({
        key: randomUUID(),
        wallet_address: wallet,
        balance_usd: 0,
      })
      .select("key, balance_usd, created_at")
      .single();

    if (error || !newKey) {
      return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
    }

    keyRow = newKey;
  }

  return NextResponse.json({
    key: keyRow.key,
    balance_usd: keyRow.balance_usd,
    treasury_wallet: process.env.TREASURY_WALLET,
    deposit_instructions: `Send USDC (SPL) to ${process.env.TREASURY_WALLET}. Your balance is credited automatically within seconds.`,
  });
}
