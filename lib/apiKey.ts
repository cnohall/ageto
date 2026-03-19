import { createClient, type ApiKey } from "./supabase";

const COST_PER_CALL = 0.01;

type AuthResult =
  | { ok: true; keyData: ApiKey }
  | { ok: false; status: number; error: string };

/**
 * Validates the Bearer token and atomically deducts $0.01 from the balance.
 *
 * Requires this function in Supabase (run once in the SQL editor):
 *
 *   create or replace function deduct_balance(p_key text, p_amount numeric)
 *   returns setof api_keys as $$
 *     update api_keys
 *     set balance_usd = balance_usd - p_amount
 *     where key = p_key and balance_usd >= p_amount
 *     returning *;
 *   $$ language sql security definer;
 */
export async function authorizeRequest(
  authHeader: string | null
): Promise<AuthResult> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Missing or invalid Authorization header" };
  }

  const key = authHeader.slice(7).trim();
  if (!key) {
    return { ok: false, status: 401, error: "Empty API key" };
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("deduct_balance", {
    p_key: key,
    p_amount: COST_PER_CALL,
  });

  if (error || !data || data.length === 0) {
    // Distinguish between invalid key and insufficient balance
    const { data: keyRow } = await supabase
      .from("api_keys")
      .select("balance_usd")
      .eq("key", key)
      .single();

    if (!keyRow) {
      return { ok: false, status: 401, error: "Invalid API key" };
    }
    return {
      ok: false,
      status: 402,
      error: `Insufficient balance ($${keyRow.balance_usd.toFixed(2)} remaining). Top up at ${process.env.NEXT_PUBLIC_APP_URL}`,
    };
  }

  return { ok: true, keyData: data[0] as ApiKey };
}

export async function logUsage(apiKeyId: string, mint: string) {
  const supabase = createClient();
  await supabase.from("usage_log").insert({
    api_key_id: apiKeyId,
    mint_address: mint,
    cost_usd: COST_PER_CALL,
  });
}
