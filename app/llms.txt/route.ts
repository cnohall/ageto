export async function GET() {
  const content = `# TokenProbe

> Solana token intelligence API for AI agents. One endpoint returns price, volume, liquidity, and on-chain holder concentration for any Solana token. Pay $0.01 per query in USDC. No subscriptions, no API key signup — deposit USDC to your wallet address and query immediately.

## API

### Get token data

\`\`\`
GET https://tokenprobe.nohall.dev/api/token/{mint_address}
Authorization: Bearer {api_key}
\`\`\`

Returns:
- price_usd: current price in USD
- price_change_24h_pct: 24h price change percentage
- volume_24h_usd: 24h trading volume in USD
- liquidity_usd: total liquidity across DEX pairs in USD
- market_cap_usd: fully diluted valuation
- top_10_holders_pct: percentage of supply held by top 10 wallets
- timestamp: ISO 8601 timestamp of the response

### Authentication

All requests require a Bearer token in the Authorization header. API keys are tied to a USDC balance on Solana. Each call costs $0.01.

### Getting an API key

1. Visit https://tokenprobe.nohall.dev
2. Connect your Phantom wallet
3. Send USDC to the treasury wallet address shown
4. Your API key is generated and credited automatically

## Pricing

- $0.01 per API call
- Minimum deposit: $5 USDC (500 calls)
- Payment: USDC on Solana (SPL token)
- No subscription, no expiry

## Data sources

- Price, volume, liquidity: DexScreener (real-time DEX aggregation)
- Holder concentration: Helius RPC (on-chain token accounts)

## Rate limits

No hard rate limits. Balance is deducted per call. High-frequency usage is supported.

## Example response

\`\`\`json
{
  "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "symbol": "Bonk",
  "name": "Bonk",
  "price_usd": 0.000006118,
  "price_change_24h_pct": -9.65,
  "volume_24h_usd": 9021.63,
  "liquidity_usd": 877275.75,
  "market_cap_usd": 543711596,
  "top_10_holders_pct": 32.14,
  "timestamp": "2026-03-19T05:29:43.531Z"
}
\`\`\`
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
