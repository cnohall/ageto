import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type ApiKey = {
  id: string;
  key: string;
  wallet_address: string;
  balance_usd: number;
  created_at: string;
};

export function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient(url, key);
}
