import { describe, expect, it } from "vitest";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import { blockingIssuesForSubmit } from "@/lib/onboarding/application-submit-blocking";

describe("blockingIssuesForSubmit", () => {
  it("returns issues when deposit is not verified", () => {
    const resource = {
      ...SAMPLE_APPLICATION_RESOURCE,
      lifecycleState: "DRAFT" as const,
      financing: {
        ...SAMPLE_APPLICATION_RESOURCE.financing!,
        depositPayment: { method: "stk" as const, status: "pending" as const },
      },
    };
    const issues = blockingIssuesForSubmit(resource);
    expect(
      issues.some((i) => i.code === "financing.deposit_payment"),
    ).toBe(true);
  });

  it("returns no issues when resource passes all submit gates", () => {
    const resource = {
      ...SAMPLE_APPLICATION_RESOURCE,
      lifecycleState: "DRAFT" as const,
      leadId: "lead_test",
      leadSource: "PORTAL",
      references: {
        customerConsent: true,
        entries: [
          {
            name: "Ref One",
            nationalId: "12345678",
            phone: "+254712345678",
            relationship: "sibling",
            called: true,
          },
          {
            name: "Ref Two",
            nationalId: "23456789",
            phone: "+254712345679",
            relationship: "friend",
            called: true,
          },
          {
            name: "Ref Three",
            nationalId: "34567890",
            phone: "+254712345670",
            relationship: "colleague",
            called: true,
          },
        ],
        nextOfKin: null,
      },
    };
    const issues = blockingIssuesForSubmit(resource);
    expect(issues.length).toBe(0);
  });
});
