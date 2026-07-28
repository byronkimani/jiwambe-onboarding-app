import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { lookupQuote } from "@/lib/onboarding/fixtures/capture-fixtures";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? "";
  const deposit = Number(searchParams.get("deposit") ?? "0");
  const quote = lookupQuote(productId, deposit);
  if (!quote) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    productId,
    deposit,
    dailyInstallmentKes: quote.dailyKes,
    minDepositKes: quote.minDeposit,
    currency: "KES",
  });
}
