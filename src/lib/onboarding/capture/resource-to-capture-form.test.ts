import { describe, expect, it } from "vitest";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";
import { firstIncompleteCaptureStage } from "@/lib/onboarding/capture/first-incomplete-capture-stage";

describe("hydrateCaptureFormFromResource", () => {
  it("maps customer and financing from sample resource", () => {
    const form = hydrateCaptureFormFromResource(SAMPLE_APPLICATION_RESOURCE);
    expect(form.name).toBe(SAMPLE_APPLICATION_RESOURCE.customer?.legalName);
    expect(form.opModel).toBe("FLEET");
    expect(form.stkVerified).toBe(true);
  });

  it("maps good conduct from issuedOn without certificate", () => {
    const form = hydrateCaptureFormFromResource({
      ...SAMPLE_APPLICATION_RESOURCE,
      goodConduct: { issuedOn: "2026-03-01" },
    });
    expect(form.cogcSituation).toBe("have");
  });
});

describe("firstIncompleteCaptureStage", () => {
  it("returns lookup when readiness complete but customer not chosen", () => {
    const form = hydrateCaptureFormFromResource({
      ...SAMPLE_APPLICATION_RESOURCE,
      customer: null,
      leadId: null,
      leadSource: null,
      lifecycleState: "DRAFT",
    });
    expect(firstIncompleteCaptureStage(form)).toBe("lookup");
  });
});
