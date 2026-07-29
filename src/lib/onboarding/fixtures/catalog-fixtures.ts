import type { CatalogProduct } from "@/lib/onboarding/schemas/catalog-schemas";
import { CATALOG_PRODUCTS } from "@/lib/onboarding/fixtures/capture-fixtures";

export function getSeedCatalogProducts(): CatalogProduct[] {
  return CATALOG_PRODUCTS.map((p) => ({
    id: p.id,
    label: p.label,
    listPriceKes: p.priceNew,
    assetCondition: "new" as const,
    imageUrl: null,
  }));
}
