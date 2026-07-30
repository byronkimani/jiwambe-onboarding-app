import {
  CATALOG_PRODUCTS,
} from "@/lib/onboarding/fixtures/capture-fixtures";
import {
  getMinDepositKesForOperatingModel,
  type OperatingModelKey,
} from "@/lib/onboarding/catalog/pricing-rules";

export type { OperatingModelKey };

export type CatalogQuoteRequest = {
  productId: string;
  depositKes: number;
  termMonths: number;
  operatingModel: OperatingModelKey;
  assetCondition?: "new" | "used";
};

export type CatalogQuoteResult = {
  productId: string;
  depositKes: number;
  termMonths: number;
  operatingModel: OperatingModelKey;
  assetCondition: "new" | "used";
  assetPriceKes: number;
  financedAmountKes: number;
  dailyAmountKes: number;
  minDepositKes: number;
  currency: "KES";
};

const OPERATING_MODELS = new Set<string>(
  Object.keys(
    {
      FLEET: 1,
      STAGE: 1,
      DELIVERY: 1,
      PERSONAL: 1,
    } satisfies Record<OperatingModelKey, number>,
  ),
);

export function isOperatingModelKey(value: string): value is OperatingModelKey {
  return OPERATING_MODELS.has(value);
}

function assetPriceKes(
  productId: string,
  assetCondition: "new" | "used",
): number | null {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) return null;
  return assetCondition === "used" ? product.priceUsed : product.priceNew;
}

/** Server-only financing math — mirrors prototype `calcDaily`, not used in the client. */
export function computeDailyInstallmentKes(
  assetPriceKes: number,
  depositKes: number,
  termMonths: number,
): number {
  const financed = Math.max(assetPriceKes - depositKes, 0);
  const factor = termMonths === 18 ? 1.34 : 1.44;
  const payDays = termMonths * 26;
  return Math.ceil((financed * factor) / payDays / 10) * 10;
}

export function resolveCatalogQuote(
  request: CatalogQuoteRequest,
): CatalogQuoteResult | null {
  const assetCondition = request.assetCondition ?? "new";
  const price = assetPriceKes(request.productId, assetCondition);
  if (price == null || !isOperatingModelKey(request.operatingModel)) {
    return null;
  }

  const minDepositKes = getMinDepositKesForOperatingModel(request.operatingModel);
  const termMonths = request.termMonths === 24 ? 24 : 18;
  const depositKes = Math.max(0, request.depositKes);
  const dailyAmountKes = computeDailyInstallmentKes(
    price,
    depositKes,
    termMonths,
  );

  return {
    productId: request.productId,
    depositKes,
    termMonths,
    operatingModel: request.operatingModel,
    assetCondition,
    assetPriceKes: price,
    financedAmountKes: Math.max(price - depositKes, 0),
    dailyAmountKes,
    minDepositKes,
    currency: "KES",
  };
}
