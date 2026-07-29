import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import { draftPatchBodyForStage } from "./draft-patch-for-stage";

describe("draftPatchBodyForStage", () => {
  it("returns partial customer with name only on identity", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace Wanjiku";
    form.phone = "invalid";
    const body = draftPatchBodyForStage("identity", form, 2);
    expect(body?.customer?.legalName).toBe("Grace Wanjiku");
    expect(body?.customer?.phone).toBeUndefined();
  });

  it("includes valid phone when present", () => {
    const form = createEmptyCaptureForm();
    form.phone = "0712 334 556";
    const body = draftPatchBodyForStage("identity", form, 2);
    expect(body?.customer?.phone).toBe("254712334556");
  });

  it("returns lookup patch when portal selected", () => {
    const form = createEmptyCaptureForm();
    form.customerFound = "portal";
    const body = draftPatchBodyForStage("identity", form, 1, {
      leadId: "lead_1",
      leadSource: "PORTAL",
    });
    expect(body).toBeNull();
    const lookupBody = draftPatchBodyForStage("lookup", form, 1, {
      leadId: "lead_1",
      leadSource: "PORTAL",
    });
    expect(lookupBody?.leadId).toBe("lead_1");
  });

  it("returns null for empty lookup", () => {
    const form = createEmptyCaptureForm();
    expect(draftPatchBodyForStage("lookup", form, 1)).toBeNull();
  });
});
