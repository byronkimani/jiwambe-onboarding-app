import { describe, expect, it, beforeEach } from "vitest";
import {
  E2E_MPESA_RECEIPT,
  mockDepositStk,
  mockDepositValidate,
  resetDepositsMockState,
} from "./deposits-mock-state";
import {
  mockCreateApplication,
  resetApplicationsMockState,
} from "./applications-mock-state";

describe("deposits-mock-state", () => {
  beforeEach(() => {
    resetApplicationsMockState();
    resetDepositsMockState();
  });

  function createDraft() {
    return mockCreateApplication({
      readinessAttestations: {
        hasId: true,
        knowsKra: true,
        dlKnown: true,
        cogcKnown: true,
        hasFunds: true,
        refsBriefed: true,
      },
    });
  }

  it("STK then validate verifies deposit", () => {
    const created = createDraft();
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const ref = created.application.referenceCode;
    const stk = mockDepositStk({
      applicationReferenceCode: ref,
      depositKes: 10000,
    });
    expect(stk.ok).toBe(true);
    if (!stk.ok) return;

    const pending = mockDepositValidate({
      applicationReferenceCode: ref,
      checkoutId: stk.checkoutId,
    });
    expect(pending.ok).toBe(true);
    if (!pending.ok) return;
    expect(pending.status).toBe("pending");

    const verified = mockDepositValidate({
      applicationReferenceCode: ref,
      checkoutId: stk.checkoutId,
    });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.status).toBe("verified");
  });

  it("fallback receipt verifies with E2E code", () => {
    const created = createDraft();
    if (!created.ok) return;
    const result = mockDepositValidate({
      applicationReferenceCode: created.application.referenceCode,
      mpesaReceipt: E2E_MPESA_RECEIPT,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("verified");
  });
});
