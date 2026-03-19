import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest, logUsage } from "@/lib/apiKey";
import { getTokenData } from "@/lib/tokenData";

export async function GET(
  req: NextRequest,
  { params }: { params: { mint: string } }
) {
  // 1. Authorize
  const auth = await authorizeRequest(req.headers.get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { mint } = params;

  // 2. Fetch aggregated token data
  try {
    const data = await getTokenData(mint);

    // 3. Log usage (non-blocking — don't await)
    logUsage(auth.keyData.id, mint).catch(console.error);

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch token data";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
