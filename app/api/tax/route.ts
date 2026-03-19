import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { authorizeRequest } from "@/lib/apiKey";
import { fetchTaxTransactions } from "@/lib/heliusTax";
import { buildPriceCache, applyPrices } from "@/lib/priceCache";
import { generateCsv, generateSummary } from "@/lib/csvGenerator";

const TAX_REPORT_COST = 10.0;
const CURRENT_YEAR = new Date().getFullYear() - 1;

function isDemoKey(authHeader: string | null): boolean {
  const demoKey = process.env.DEMO_API_KEY;
  if (!demoKey || !authHeader) return false;
  return authHeader === `Bearer ${demoKey}`;
}

// POST /api/tax — generate a tax report
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const demo = isDemoKey(authHeader);

  // 1. Authorize — skip balance deduction for demo key
  let keyId = "demo";
  if (!demo) {
    const auth = await authorizeRequest(authHeader, TAX_REPORT_COST);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    keyId = auth.keyData.id;
  }

  const body = await req.json();
  // Demo mode: always use the configured demo wallet
  const wallet: string = demo
    ? (process.env.DEMO_WALLET ?? body.wallet)
    : body.wallet;
  const year: number = body.year ?? CURRENT_YEAR;

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
  }

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid Solana wallet address" }, { status: 400 });
  }

  if (year < 2020 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "Invalid tax year" }, { status: 400 });
  }

  const supabase = createClient();

  // 2. Create a pending report record
  const { data: report, error: insertError } = await supabase
    .from("tax_reports")
    .insert({
      api_key_id: demo ? null : keyId,
      wallet_address: wallet,
      tax_year: year,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !report) {
    console.error("Failed to create tax report:", insertError);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }

  try {
    // 3. Fetch transactions from Helius
    const rawEvents = await fetchTaxTransactions(wallet, year);

    if (rawEvents.length === 0) {
      await supabase
        .from("tax_reports")
        .update({
          status: "complete",
          transaction_count: 0,
          summary: `No taxable transactions found for ${wallet} in ${year}.`,
          csv_data: "Date,Type,Token Sold,Amount Sold,Token Received,Amount Received,USD Value (Approx),SOL Value (Approx),Transaction ID,Notes",
        })
        .eq("id", report.id);

      return NextResponse.json({
        report_id: report.id,
        transaction_count: 0,
        summary: `No taxable transactions found for ${year}.`,
        csv_data: "",
      });
    }

    // 4. Fetch historical SOL prices for the full year in one API call
    const priceCache = await buildPriceCache(year);
    const events = applyPrices(rawEvents, priceCache);

    // 5. Generate CSV and summary
    const csv = generateCsv(events);
    const summary = generateSummary(events, year);

    // 6. Save to Supabase
    await supabase
      .from("tax_reports")
      .update({
        status: "complete",
        transaction_count: events.length,
        summary,
        csv_data: csv,
      })
      .eq("id", report.id);

    return NextResponse.json({
      report_id: report.id,
      transaction_count: events.length,
      summary,
      csv_data: csv,
    });
  } catch (err) {
    console.error("Tax report error:", err);

    await supabase
      .from("tax_reports")
      .update({ status: "error" })
      .eq("id", report.id);

    return NextResponse.json(
      { error: "Failed to process transactions. Please try again." },
      { status: 502 }
    );
  }
}

// GET /api/tax?report_id=xxx — fetch a completed report
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("report_id");
  if (!reportId) {
    return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tax_reports")
    .select("id, status, transaction_count, summary, csv_data, created_at")
    .eq("id", reportId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
