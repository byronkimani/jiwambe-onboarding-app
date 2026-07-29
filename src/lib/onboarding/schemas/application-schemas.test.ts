import { describe, expect, it } from "vitest";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import {
  createApplicationRequestSchema,
  customerLookupRequestSchema,
  normalizeCustomerLookupRequest,
  onboardingApplicationResourceSchema,
  patchApplicationRequestSchema,
} from "./application-schemas";
import { parseApplicationResource } from "./parse-onboarding-json";

describe("application-schemas", () => {
  it("parses sample resource", () => {
    const result = onboardingApplicationResourceSchema.safeParse(
      SAMPLE_APPLICATION_RESOURCE,
    );
    expect(result.success).toBe(true);
  });

  it("requires all readiness flags true on create", () => {
    const result = createApplicationRequestSchema.safeParse({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: false,
      },
    });
    expect(result.success).toBe(false);
  });

  it("patch rejects unknown keys", () => {
    const result = patchApplicationRequestSchema.safeParse({
      version: 1,
      unknown: true,
    });
    expect(result.success).toBe(false);
  });

  it("lookup requires phone or nationalId", () => {
    expect(customerLookupRequestSchema.safeParse({}).success).toBe(false);
    expect(
      customerLookupRequestSchema.safeParse({ phone: "0712 334 556" }).success,
    ).toBe(true);
  });

  it("normalizes lookup phone to wire", () => {
    const normalized = normalizeCustomerLookupRequest({
      phone: "0712 334 556",
    });
    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect(normalized.phone).toBe("254712334556");
    }
  });

  it("parseApplicationResource accepts wrapped response", () => {
    const parsed = parseApplicationResource({
      application: SAMPLE_APPLICATION_RESOURCE,
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.referenceCode).toBe("A-1042");
    }
  });
});
