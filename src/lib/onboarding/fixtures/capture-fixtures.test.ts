import { describe, expect, it } from "vitest";
import { lookupQuote } from "./capture-fixtures";

describe("capture-fixtures", () => {
  it("returns pre-seeded quote for product and deposit", () => {
    const quote = lookupQuote("spiro-tv", 15000);
    expect(quote?.dailyKes).toBe(510);
  });

  it("returns null for unknown product", () => {
    expect(lookupQuote("unknown", 10000)).toBeNull();
  });
});
