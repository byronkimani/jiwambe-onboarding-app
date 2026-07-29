import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { lookupQuote } from "@/lib/onboarding/fixtures/capture-fixtures";

function quoteResponse(productId: string, deposit: number) {
  const quote = lookupQuote(productId, deposit);
  if (!quote) {
    return null;
  }
  return {
    productId,
    depositKes: deposit,
    dailyAmountKes: quote.dailyKes,
    minDepositKes: quote.minDeposit,
    currency: "KES" as const,
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? "";
  const deposit = Number(searchParams.get("deposit") ?? "0");
  const body = quoteResponse(productId, deposit);
  if (!body) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ...body,
    dailyInstallmentKes: body.dailyAmountKes,
    deposit,
  });
}

/** Contract: POST `/onboarding/catalog/quotes` — preferred for new clients. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: {
    productId?: string;
    depositKes?: number;
    termMonths?: number;
    operatingModel?: string;
  };
  try {
    json = (await request.json()) as typeof json;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const productId = json.productId ?? "";
  const deposit = Number(json.depositKes ?? 0);
  const body = quoteResponse(productId, deposit);
  if (!body) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ...body,
    termMonths: json.termMonths ?? 24,
    operatingModel: json.operatingModel ?? null,
  });
}
