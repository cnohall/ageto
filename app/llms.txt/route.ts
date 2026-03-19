export async function GET() {
  const content = `# TokenProbe

> Solana tax export tool. Generates a clean CSV of all taxable Solana wallet activity — swaps, transfers, and airdrops — with approximate USD values at time of transaction. Designed for Solana DeFi users (Jupiter, pump.fun, Raydium) who need accurate transaction data for tax filing. $10 per wallet per year, paid in USDC on Solana.

## What it does

TokenProbe fetches the full transaction history of a Solana wallet for a given tax year and exports it as a structured CSV file. Each row represents a taxable event with date, token amounts, and approximate USD value based on daily SOL/USD closing prices.

## Who it's for

- Solana DeFi users who have made swaps on Jupiter, Raydium, Orca, or pump.fun
- Users whose existing tax tools (Koinly, CoinLedger) show "Unknown Transaction" errors for Solana DeFi activity
- Anyone who received a 1099-DA with missing cost basis for their DeFi transactions

## How to use

1. Visit https://tokenprobe.nohall.dev/tax
2. Connect your Phantom wallet
3. Deposit $10 USDC to the treasury wallet shown
4. Select your tax year
5. Click "Generate Report"
6. Download the CSV

## CSV format

Columns: Date, Type, Token Sold, Amount Sold, Token Received, Amount Received, USD Value (Approx), SOL Value (Approx), Transaction ID, Notes

Transaction types: SWAP, TRANSFER_IN, TRANSFER_OUT

## Pricing

- $10 per wallet per year
- Payment: USDC on Solana (SPL token)
- No subscription, no account required, balance never expires

## Limitations

- USD values are approximate based on daily SOL/USD closing prices from CoinGecko
- Maximum 500 transactions per report
- This is a data preparation tool only — not tax advice
- Consult a qualified tax professional for final tax calculations

## Data sources

- Transaction data: Helius Enhanced Transactions API (Solana)
- Historical SOL prices: CoinGecko public API
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
