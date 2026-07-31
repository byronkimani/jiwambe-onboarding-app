import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import {
  isOperatingModelKey,
  resolveCatalogQuote,
} from "@/lib/onboarding/catalog/quotes";

type QuoteBody = {
  productId?: string;
  depositKes?: number;
  termMonths?: number;
  operatingModel?: string;
  assetCondition?: string;
};

function parseQuoteBody(json: QuoteBody) {
  const productId = json.productId?.trim() ?? "";
  const depositKes = Number(json.depositKes ?? 0);
  const termMonths = Number(json.termMonths ?? 18);
  const operatingModel = json.operatingModel?.trim() ?? "";
  const assetCondition =
    json.assetCondition === "used" ? ("used" as const) : ("new" as const);

  if (!productId || !Number.isFinite(depositKes) || depositKes < 0) {
    return { error: "invalid_body" as const };
  }
  if (!isOperatingModelKey(operatingModel)) {
    return { error: "invalid_operating_model" as const };
  }
  if (!Number.isFinite(termMonths) || (termMonths !== 18 && termMonths !== 24)) {
    return { error: "invalid_term" as const };
  }

  return {
    request: {
      productId,
      depositKes,
      termMonths,
      operatingModel,
      assetCondition,
    },
  };
}

/** Contract: POST `/catalog/quotes` — financing calculator (daily + min deposit). */
export async function POST(request: Request) {
  let json: QuoteBody;
  try {
    json = (await request.json()) as QuoteBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseQuoteBody(json);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const upstream = await onboardingUpstream("/catalog/quotes", {
    method: "POST",
    body: JSON.stringify(parsed.request),
  }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }
  if (upstream.ok) {
    try {
      const body = (await upstream.json()) as Record<string, unknown>;
      if (
        typeof body.dailyAmountKes === "number" &&
        typeof body.minDepositKes === "number"
      ) {
        return NextResponse.json(body);
      }
    } catch {
      // fall through to local fixture quote
    }
  }

  const quote = resolveCatalogQuote(parsed.request);
  if (!quote) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(quote);
}
