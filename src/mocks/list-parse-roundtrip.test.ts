import { describe, expect, it, beforeEach } from "vitest";
import {
  listApplicationSummaries,
  resetApplicationsMockState,
} from "@/mocks/applications-mock-state";
import { parseApplicationListResponse } from "@/lib/onboarding/schemas/parse-onboarding-json";

describe("listApplicationSummaries BFF parse roundtrip", () => {
  beforeEach(() => {
    resetApplicationsMockState();
  });

  it("seed queue parses for list response schema", () => {
    const applications = listApplicationSummaries();
    expect(applications.length).toBeGreaterThan(0);
    const parsed = parseApplicationListResponse({ applications });
    expect(parsed.ok).toBe(true);
  });
});
