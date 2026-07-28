import { describe, expect, it } from "vitest";
import { isReadinessComplete } from "./readiness";
import { READINESS_ITEMS } from "./stages";

describe("readiness", () => {
  it("blocks until all items checked", () => {
    expect(isReadinessComplete({})).toBe(false);
    const partial: Record<string, boolean> = {};
    for (const item of READINESS_ITEMS.slice(0, -1)) {
      partial[item.k] = true;
    }
    expect(isReadinessComplete(partial)).toBe(false);
    for (const item of READINESS_ITEMS) {
      partial[item.k] = true;
    }
    expect(isReadinessComplete(partial)).toBe(true);
  });
});
