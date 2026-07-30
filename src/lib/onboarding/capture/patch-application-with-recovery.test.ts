import { describe, expect, it, vi, beforeEach } from "vitest";
import { patchApplicationWithVersionRecovery } from "@/lib/onboarding/capture/patch-application-with-recovery";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const apiPatchApplication = vi.fn();
const apiFetchApplication = vi.fn();

vi.mock("@/lib/onboarding/capture/application-api", () => ({
  apiPatchApplication: (...args: unknown[]) => apiPatchApplication(...args),
  apiFetchApplication: (...args: unknown[]) => apiFetchApplication(...args),
}));

describe("patchApplicationWithVersionRecovery", () => {
  beforeEach(() => {
    apiPatchApplication.mockReset();
    apiFetchApplication.mockReset();
  });

  it("returns skipped when buildPatch yields null", async () => {
    const result = await patchApplicationWithVersionRecovery({
      referenceCode: "A-1042",
      version: 1,
      form: createEmptyCaptureForm(),
      buildPatch: () => null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.skipped).toBe(true);
    }
  });

  it("recovers from 409 by refetching and retrying", async () => {
    const refreshed = {
      ...SAMPLE_APPLICATION_RESOURCE,
      version: 18,
      customer: {
        ...SAMPLE_APPLICATION_RESOURCE.customer!,
        legalName: "Updated Name",
      },
    };

    apiPatchApplication
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        message: "conflict",
      })
      .mockResolvedValueOnce({
        ok: true,
        application: refreshed,
      });

    apiFetchApplication.mockResolvedValueOnce({
      ok: true,
      application: refreshed,
    });

    const form = createEmptyCaptureForm();
    form.name = "Stale Name";

    const result = await patchApplicationWithVersionRecovery({
      referenceCode: "A-1042",
      version: 17,
      form,
      buildPatch: (version, patchForm) => ({
        version,
        customer: { legalName: patchForm.name },
      }),
    });

    expect(result.ok).toBe(true);
    if (result.ok && !result.skipped) {
      expect(result.recoveredFromConflict).toBe(true);
      expect(result.application.version).toBe(18);
      expect(result.form?.name).toBe("Updated Name");
    }
    expect(apiPatchApplication).toHaveBeenCalledTimes(2);
  });
});
