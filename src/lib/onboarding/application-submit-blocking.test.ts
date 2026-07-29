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
      references: {
        customerConsent: true,
        entries: [
          {
            name: "Ref One",
            phone: "+254712345678",
            relationship: "sibling",
          },
          {
            name: "Ref Two",
            phone: "+254712345679",
            relationship: "friend",
          },
          {
            name: "Ref Three",
            phone: "+254712345670",
            relationship: "colleague",
          },
        ],
        nextOfKin: null,
      },
    };
    const issues = blockingIssuesForSubmit(resource);
    expect(issues.length).toBe(0);
  });
});
