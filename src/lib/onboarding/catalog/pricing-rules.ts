import {
  MIN_DEPOSIT_BY_OPERATING_MODEL,
  MIN_DEPOSIT_KES,
} from "@/lib/onboarding/fixtures/capture-fixtures";

export type OperatingModelKey = keyof typeof MIN_DEPOSIT_KES;

/** Shared catalog minimums — same values returned in quotes (`minDepositKes`) and pricing-rules. */
export function getMinDepositKesForOperatingModel(
  operatingModel: OperatingModelKey,
): number {
  return MIN_DEPOSIT_KES[operatingModel];
}

export function getOperatingModelMinDeposits() {
  return MIN_DEPOSIT_BY_OPERATING_MODEL.map(({ label, key }) => ({
    operatingModel: key,
    label,
    minDepositKes: MIN_DEPOSIT_KES[key],
  }));
}

export function getCatalogPricingRulesPayload() {
  return {
    operatingModels: getOperatingModelMinDeposits(),
    currency: "KES" as const,
  };
}
