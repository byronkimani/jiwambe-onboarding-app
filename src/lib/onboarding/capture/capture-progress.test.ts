import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import { captureStageCompleteMap } from "@/lib/onboarding/capture/capture-progress";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";

describe("captureStageCompleteMap", () => {
  it("marks readiness complete when on lookup stage", () => {
    const form = createEmptyCaptureForm();
    for (const item of READINESS_ITEMS) {
      form.readiness[item.k] = true;
    }
    const map = captureStageCompleteMap(form, "lookup");
    expect(map.readiness).toBe(true);
  });

  it("does not mark future stages before data exists", () => {
    const form = createEmptyCaptureForm();
    const map = captureStageCompleteMap(form, "identity");
    expect(map.lookup).toBeUndefined();
  });
});
