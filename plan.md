# TokenProbe — Solana Token Intelligence API

**Tagline:** One API call. Every metric your trading agent needs. Pay per query. No subscriptions, no API keys to manage.

---

## What it is

PayClaw is a data API built for AI agents. Agents call a single endpoint to get aggregated intelligence on any Solana token — price, volume, liquidity, and on-chain holder data — in one response. Payment is per-query using pre-paid USDC credits on Solana. No signup form, no monthly plan, no OAuth.

The concept is x402-inspired: the agent (or the developer running the agent) deposits a small amount of USDC once, gets an API key, and that key is debited $0.01 per call. When balance runs low, top up and continue.

---

## Target customer

Developers building autonomous trading agents, DeFi bots, or portfolio trackers on Solana. They currently stitch together 3+ API calls (Birdeye for price, Helius for holders, DexScreener for liquidity). PayClaw replaces that with one call.

**Why they pay:** They need fresh data per trade decision, meaning recurring queries 24/7. The data expires — they can't cache it. That's the natural repeat-purchase mechanic.

---

## The API

### Endpoint

```
GET /api/token/{mint_address}
Authorization: Bearer {api_key}
```

### Response

```json
{
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "symbol": "BONK",
  "name": "Bonk",
  "price_usd": 0.00001823,
  "price_change_24h_pct": 12.4,
  "volume_24h_usd": 48200000,
  "liquidity_usd": 3100000,
  "market_cap_usd": 1240000000,
  "top_10_holders_pct": 34.2,
  "timestamp": "2026-03-19T10:22:00Z"
}
```

### Pricing

- $0.01 per API call
- Minimum top-up: $5 (500 calls)
- Payment: USDC on Solana

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Already set up, handles API routes and frontend |
| Language | TypeScript | Type safety, already in use |
| Database | Supabase (free tier) | Managed Postgres, real-time webhooks, no ops overhead |
| Blockchain | Solana Mainnet | Fast (400ms), cheap, target customer is already here |
| Payment token | USDC on Solana | Stable value, widely held by Solana devs |
| Payment detection | Helius webhooks | Notifies your backend the moment USDC arrives |
| Price + volume data | DexScreener API | Free, no API key required, reliable |
| On-chain holder data | Helius API | Free tier (100k credits/month), top holders endpoint |
| Wallet integration | Solana wallet-adapter | Connect Phantom on the frontend |
| Styling | Tailwind CSS | Fast to write |
| MCP server | Custom (Node.js) | Lets Claude use your API as a tool natively |

---

## Data sources

| Data point | Source | Cost |
|---|---|---|
| Price, volume, price change | DexScreener `/dex/tokens/{mint}` | Free |
| Liquidity | DexScreener `/dex/tokens/{mint}` | Free |
| Top 10 holder % | Helius `getTokenLargestAccounts` | Free tier |
| Market cap | DexScreener or CoinGecko | Free |

No paid data subscriptions needed at hackathon scale.

---

## Database schema (Supabase)

```sql
-- API keys and balances
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  wallet_address text not null,
  balance_usd numeric default 0,
  created_at timestamptz default now()
);

-- Usage log (for debugging + future analytics)
create table usage_log (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id),
  mint_address text,
  cost_usd numeric default 0.01,
  called_at timestamptz default now()
);

-- Top-up transactions
create table topups (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id),
  amount_usdc numeric,
  tx_signature text unique,
  confirmed_at timestamptz default now()
);
```

---

## Implementation plan

### Phase 1 — Core API (Days 1–3)

- [ ] Set up Supabase project, create tables above
- [ ] Build `GET /api/token/[mint]` route
  - Call DexScreener API for price, volume, liquidity
  - Call Helius `getTokenLargestAccounts` for top holder %
  - Aggregate and return unified JSON
- [ ] API key middleware
  - Check `Authorization: Bearer {key}` header
  - Look up key in Supabase
  - Reject if balance < $0.01
  - Deduct $0.01 and log usage on success
- [ ] Basic error handling (invalid mint, unknown key, insufficient balance)

### Phase 2 — Payment flow (Days 4–6)

- [ ] Set up Helius webhook to monitor treasury wallet for incoming USDC
- [ ] Webhook handler `POST /api/webhook/helius`
  - Verify the webhook secret
  - Parse USDC transfer amount and sender wallet
  - Find or create API key for that wallet
  - Credit balance accordingly
- [ ] `POST /api/keys/create` — generates a new API key for a wallet address
- [ ] Test full flow: send USDC → balance credited → API call deducted

### Phase 3 — Frontend (Days 7–9)

- [ ] Landing page
  - Headline, one-line description, example API response
  - Pricing: $0.01/call, $5 minimum top-up
  - "Get API Key" CTA
- [ ] "Get API Key" flow
  - Connect Phantom wallet
  - Show treasury wallet address + QR code for USDC transfer
  - Poll for balance confirmation (Supabase real-time)
  - Display API key once credited
- [ ] Basic dashboard: show current balance and last 10 calls (optional, week 2 if time)

### Phase 4 — MCP server (Days 10–11)

- [ ] Create `/mcp` directory with a standalone Node.js MCP server
- [ ] Expose one tool: `get_solana_token_data(mint_address)`
  - Calls your API with a built-in API key (for demo) or accepts key as config
- [ ] Publish to GitHub with README showing how to add to Claude

### Phase 5 — Polish and launch (Days 12–14)

- [ ] Add `.env.example` with all required vars documented
- [ ] Write API docs (one markdown page: endpoint, auth, response shape, curl example, Python snippet)
- [ ] Record a 2-minute demo video: Phantom connect → deposit → API call → agent decision
- [ ] Post in Solana dev Discord, ElizaOS Discord, X
- [ ] DM 10 developers actively building trading bots

---

## Environment variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Helius
HELIUS_API_KEY=
HELIUS_WEBHOOK_SECRET=

# Solana
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
TREASURY_WALLET=   # Your USDC-receiving wallet address

# App
NEXT_PUBLIC_APP_URL=
```

---

## What you are NOT building

- A dashboard with charts
- Multi-chain support
- A token watchlist or alerts
- Per-transaction on-chain payments (too slow for agents)
- User accounts, email, OAuth
- Mobile support

Add these only after you have paying customers.

---

## Presentation angle (April 20)

**The problem:** Building a trading agent today means managing 3-5 different API keys, rate limits, and data formats. Agents can't do this autonomously.

**The solution:** One endpoint, one payment, all the data. An agent deposits $5 of USDC once and queries forever — no human in the loop.

**The demo:** Live on stage — connect Phantom, deposit $1 USDC, watch the API key appear, run a Python script that queries a token and makes a mock trade decision. Show the balance decrement in real time.

**The x402 story:** This is the payment model the internet was always missing. HTTP 402 has been reserved since 1991. AI agents are finally making it necessary.

---

*TokenProbe — built for the 2026 Agentonomics Hackathon.*
