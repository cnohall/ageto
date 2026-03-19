# TokenProbe — Solana Tax Export

**Fix your Solana taxes for $10. Clean CSV of all your swaps, transfers, and airdrops — including Jupiter, pump.fun, and Raydium. No subscription.**

---

## What it does

TokenProbe fetches the full transaction history of a Solana wallet for a given tax year and exports it as a structured CSV. Each row is a taxable event with date, token amounts, and approximate USD value at time of transaction.

Koinly and CoinLedger charge $49–$399/year and still miss pump.fun and Jupiter aggregator transactions. TokenProbe charges $10, flat.

## Running locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Helius](https://helius.dev) API key (free tier)
- A Solana wallet address to receive USDC payments

### Setup

```bash
git clone https://github.com/yourname/tokenprobe
cd tokenprobe
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
HELIUS_API_KEY=
HELIUS_WEBHOOK_SECRET=
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
TREASURY_WALLET=          # Your USDC-receiving Solana wallet
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database (Supabase SQL editor)

```sql
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  wallet_address text not null,
  balance_usd numeric default 0,
  created_at timestamptz default now()
);

create table usage_log (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id),
  mint_address text,
  cost_usd numeric default 0.01,
  called_at timestamptz default now()
);

create table topups (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id),
  amount_usdc numeric,
  tx_signature text unique,
  confirmed_at timestamptz default now()
);

create table tax_reports (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id),
  wallet_address text not null,
  tax_year integer not null,
  status text default 'pending',
  transaction_count integer,
  summary text,
  csv_data text,
  created_at timestamptz default now()
);

create or replace function deduct_balance(p_key text, p_amount numeric)
returns setof api_keys as $$
  update api_keys
  set balance_usd = balance_usd - p_amount
  where key = p_key and balance_usd >= p_amount
  returning *;
$$ language sql security definer;
```

### Run

```bash
npm run dev
```

App at `http://localhost:3000`. Tax export at `http://localhost:3000/tax`.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase
- **Payment:** USDC on Solana, detected via Helius webhooks
- **Transaction data:** Helius Enhanced Transactions API
- **Price history:** CoinGecko public API
- **Wallet:** Phantom (via `window.solana`)

---

## Key routes

| Route | Description |
|---|---|
| `GET /` | Landing page |
| `GET /tax` | Tax export flow (connect wallet → pay → download) |
| `GET /get-started` | API key flow (for token API users) |
| `POST /api/tax` | Generate tax report (requires Bearer token, costs $10) |
| `GET /api/tax?report_id=` | Fetch existing report |
| `GET /api/token/[mint]` | Token intelligence endpoint (costs $0.01) |
| `GET /api/keys?wallet=` | Get/create API key for a wallet |
| `POST /api/webhook/helius` | USDC deposit webhook |
| `GET /llms.txt` | Product description for AI agents |

---

## Disclaimer

TokenProbe is a data preparation tool, not tax advice. USD values are approximate. Consult a qualified tax professional for final tax calculations and filings.

---

*Built for the 2026 Agentonomics Hackathon.*
