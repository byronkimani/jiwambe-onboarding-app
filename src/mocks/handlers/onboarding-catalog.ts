import { http, HttpResponse } from "msw";
import { getSeedCatalogProducts } from "@/lib/onboarding/fixtures/catalog-fixtures";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

export const onboardingCatalogHandlers = [
  http.get(upstreamPath("/onboarding/catalog/products"), () => {
    return HttpResponse.json({ products: getSeedCatalogProducts() });
  }),
];
