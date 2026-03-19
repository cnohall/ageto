# TokenProbe

**Solana token intelligence for AI agents. One endpoint, pay per query.**

---

## What it does

TokenProbe gives AI agents a single API call to get everything they need to make a decision about a Solana token: price, volume, liquidity, and on-chain holder concentration. No subscriptions, no managing multiple API keys — deposit USDC once, query as needed.

## Who it's for

Developers building autonomous trading agents, DeFi bots, or portfolio trackers on Solana. Instead of stitching together DexScreener + Helius + CoinGecko in their agent code, they call one endpoint.

## The endpoint

```
GET /api/token/{mint_address}
Authorization: Bearer {api_key}
```

**Response:**
```json
{
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "symbol": "BONK",
  "price_usd": 0.00001823,
  "price_change_24h_pct": 12.4,
  "volume_24h_usd": 48200000,
  "liquidity_usd": 3100000,
  "market_cap_usd": 1240000000,
  "top_10_holders_pct": 34.2,
  "timestamp": "2026-03-19T10:22:00Z"
}
```

**Cost:** $0.01 per call. Minimum top-up: $5 USDC on Solana.

---

## Running locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Helius](https://helius.dev) API key (free tier)
- A Solana wallet address to receive USDC (treasury)

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

### Database

Run the following in your Supabase SQL editor:

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
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### Testing the API

```bash
curl http://localhost:3000/api/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Using with Claude (MCP)

Add TokenProbe as a tool in Claude by pointing it at the MCP server:

```json
{
  "mcpServers": {
    "tokenprobe": {
      "command": "node",
      "args": ["./mcp/index.js"],
      "env": {
        "TOKENPROBE_API_KEY": "your_api_key"
      }
    }
  }
}
```

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase
- **Payment:** USDC on Solana, detected via Helius webhooks
- **Data:** DexScreener API + Helius API (both free tier)
- **Wallet:** Phantom via Solana wallet-adapter

---

*Built for the 2026 Agentonomics Hackathon.*
