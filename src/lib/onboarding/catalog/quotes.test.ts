import { describe, expect, it } from "vitest";
import {
  computeDailyInstallmentKes,
  resolveCatalogQuote,
} from "./quotes";

describe("catalog quotes", () => {
  it("computes a lower daily when deposit increases", () => {
    const price = 265_000;
    const lowDeposit = computeDailyInstallmentKes(price, 10_000, 18);
    const highDeposit = computeDailyInstallmentKes(price, 20_000, 18);
    expect(highDeposit).toBeLessThan(lowDeposit);
  });

  it("returns operating-model minimum deposit in the quote", () => {
    const quote = resolveCatalogQuote({
      productId: "spiro-tv",
      depositKes: 15_000,
      termMonths: 18,
      operatingModel: "PERSONAL",
    });
    expect(quote?.minDepositKes).toBe(30_000);
    expect(quote?.dailyAmountKes).toBeGreaterThan(0);
  });

  it("returns null for unknown products", () => {
    expect(
      resolveCatalogQuote({
        productId: "unknown",
        depositKes: 10_000,
        termMonths: 18,
        operatingModel: "FLEET",
      }),
    ).toBeNull();
  });
});
