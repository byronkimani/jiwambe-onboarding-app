import { http, HttpResponse } from "msw";
import { getCatalogPricingRulesPayload } from "@/lib/onboarding/catalog/pricing-rules";
import { resolveCatalogQuote } from "@/lib/onboarding/catalog/quotes";
import { getSeedCatalogProducts } from "@/lib/onboarding/fixtures/catalog-fixtures";
import { fieldUpstreamPath } from "@/mocks/handlers/upstream-path";

export const ecosystemCatalogHandlers = [
  http.get(fieldUpstreamPath("/products"), () => {
    return HttpResponse.json({ products: getSeedCatalogProducts() });
  }),
  http.get(fieldUpstreamPath("/products/pricing-rules"), () => {
    return HttpResponse.json(getCatalogPricingRulesPayload());
  }),
  http.post(fieldUpstreamPath("/products/quote"), async ({ request }) => {
    const body = (await request.json()) as {
      productId?: string;
      depositKes?: number;
      termMonths?: number;
      operatingModel?: string;
      assetCondition?: string;
    };
    const quote = resolveCatalogQuote({
      productId: body.productId ?? "",
      depositKes: Number(body.depositKes ?? 0),
      termMonths: Number(body.termMonths ?? 18),
    operatingModel:
      (body.operatingModel as "FLEET" | "STAGE" | "DELIVERY" | "PERSONAL") ||
      "FLEET",
      assetCondition: body.assetCondition === "used" ? "used" : "new",
    });
    if (!quote) {
      return HttpResponse.json({ error: "not_found" }, { status: 404 });
    }
    return HttpResponse.json(quote);
  }),
];
