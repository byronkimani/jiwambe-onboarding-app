import { describe, expect, it, beforeEach } from "vitest";
import {
  getApplicationsMockState,
  listApplicationSummaries,
  mockCreateApplication,
  mockCustomerLookup,
  mockGetCurrentApplication,
  mockPatchApplication,
  mockPauseApplication,
  mockSubmitApplication,
  mockDisqualifyApplication,
  resetApplicationsMockState,
} from "./applications-mock-state";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

describe("applications-mock-state", () => {
  beforeEach(() => {
    resetApplicationsMockState();
  });

  it("lists seed summaries", () => {
    const state = getApplicationsMockState();
    expect(state.byReferenceCode.size).toBeGreaterThan(0);
  });

  it("default list excludes DISQUALIFIED and drafts", () => {
    const queue = listApplicationSummaries();
    expect(queue.some((s) => s.lifecycleState === "DISQUALIFIED")).toBe(false);
    expect(queue.some((s) => s.lifecycleState === "DRAFT")).toBe(false);
    const history = listApplicationSummaries({ scope: "history" });
    expect(history.some((s) => s.referenceCode === "A-1018")).toBe(true);
  });

  it("creates draft application", () => {
    const result = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.lifecycleState).toBe("DRAFT");
      expect(result.application.version).toBe(1);
    }
  });

  it("patches with version increment", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const patched = mockPatchApplication(created.application.referenceCode, {
      version: 1,
      customer: { legalName: "Test User", phone: "254712000000" },
    });
    expect(patched.ok).toBe(true);
    if (patched.ok) {
      expect(patched.application.version).toBe(2);
      expect(patched.application.customer?.legalName).toBe("Test User");
    }
  });

  it("returns 409 on version conflict", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    if (!created.ok) return;
    const conflict = mockPatchApplication(created.application.referenceCode, {
      version: 99,
      customer: { legalName: "X" },
    });
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) {
      expect(conflict.status).toBe(409);
    }
  });

  it("finds portal customer by phone", () => {
    const result = mockCustomerLookup({ phone: "0712 334 556" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.length).toBeGreaterThan(0);
    }
  });

  it("finds portal customer by wire phone from BFF normalization", () => {
    const result = mockCustomerLookup({ phone: "254712334556" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.some((m) => m.displayName === "Grace Wanjiku")).toBe(
        true,
      );
    }
  });

  it("pauses application and clears bike", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    if (!created.ok) return;
    const paused = mockPauseApplication(created.application.referenceCode, {
      reason: "Customer stepped out briefly",
    });
    expect(paused.ok).toBe(true);
    if (paused.ok) {
      expect(paused.application.lifecycleState).toBe("PAUSED");
      expect(paused.application.pause?.reason).toContain("stepped out");
      expect(paused.application.bikeAssignment).toBeNull();
    }
  });

  it("returns most recent open application for current officer", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const current = mockGetCurrentApplication();
    expect(current.ok).toBe(true);
    if (current.ok) {
      expect(current.application.referenceCode).toBe(
        created.application.referenceCode,
      );
    }
  });

  it("submit moves complete draft to OPS_REVIEW", () => {
    const draft = {
      ...SAMPLE_APPLICATION_RESOURCE,
      lifecycleState: "DRAFT" as const,
      version: 1,
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
    getApplicationsMockState().byReferenceCode.set(draft.referenceCode, draft);

    const result = mockSubmitApplication(draft.referenceCode, {
      officerAttestation: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.lifecycleState).toBe("OPS_REVIEW");
      expect(result.application.submission.submittedAt).toBeTruthy();
    }
  });

  it("submit returns 422 for incomplete draft", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = mockSubmitApplication(created.application.referenceCode, {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
      expect(result.blockingIssues?.length).toBeGreaterThan(0);
    }
  });

  it("disqualify closes draft application", () => {
    const created = mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
    if (!created.ok) return;

    const result = mockDisqualifyApplication(created.application.referenceCode, {
      reason: "Customer declined to proceed",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.lifecycleState).toBe("DISQUALIFIED");
      expect(result.application.operations.opsNote).toContain("declined");
    }
  });

  it("disqualify rejects submitted OPS_REVIEW application", () => {
    const seeded = getApplicationsMockState().byReferenceCode.get("A-1044");
    expect(seeded).toBeDefined();
    if (!seeded) return;

    getApplicationsMockState().byReferenceCode.set(seeded.referenceCode, {
      ...seeded,
      lifecycleState: "OPS_REVIEW",
    });

    const result = mockDisqualifyApplication(seeded.referenceCode, {
      reason: "Should not apply after submit",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toBe("invalid_state");
    }
  });
});
