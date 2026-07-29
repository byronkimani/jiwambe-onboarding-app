import {
  findApplicationByIdOrRef,
  getApplicationsMockState,
} from "@/mocks/applications-mock-state";
import {
  depositStkRequestSchema,
  depositValidateRequestSchema,
} from "@/lib/onboarding/schemas/deposit-schemas";

/** Deterministic receipt for Playwright E2E (10+ chars). */
export const E2E_MPESA_RECEIPT = "UGE2ETEST01";

type CheckoutRecord = {
  applicationReferenceCode: string;
  depositKes: number;
  status: "waiting" | "verified" | "failed";
  createdAt: number;
  validateAttempts: number;
};

const GLOBAL_KEY = "__jiwambeOnboardingDepositsMockState" as const;

type DepositsMockState = {
  checkouts: Map<string, CheckoutRecord>;
};

function getState(): DepositsMockState {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DepositsMockState;
  };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { checkouts: new Map() };
  }
  return g[GLOBAL_KEY];
}

export function resetDepositsMockState(): void {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DepositsMockState;
  };
  g[GLOBAL_KEY] = { checkouts: new Map() };
}

export type MockStkResult =
  | {
      ok: true;
      checkoutId: string;
      status: "initiated" | "waiting";
      expiresAt: string;
    }
  | { ok: false; status: number; error: string };

export function mockDepositStk(body: unknown): MockStkResult {
  const parsed = depositStkRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const app = findApplicationByIdOrRef(parsed.data.applicationReferenceCode);
  if (!app) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const checkoutId = `ws_CO_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  getState().checkouts.set(checkoutId, {
    applicationReferenceCode: parsed.data.applicationReferenceCode,
    depositKes: parsed.data.depositKes,
    status: "waiting",
    createdAt: Date.now(),
    validateAttempts: 0,
  });

  return {
    ok: true,
    checkoutId,
    status: "waiting",
    expiresAt,
  };
}

export type MockValidateResult =
  | {
      ok: true;
      status: "verified" | "pending" | "failed";
      mpesaReceipt?: string | null;
      depositPayment?: {
        method: "stk" | "mpesa_code";
        status: "pending" | "verified" | "failed";
        verifiedAt?: string | null;
        mpesaReceipt?: string | null;
      } | null;
      applicationVersion?: number;
    }
  | { ok: false; status: number; error: string };

function applyVerifiedDeposit(
  referenceCode: string,
  depositKes: number,
  method: "stk" | "mpesa_code",
  mpesaReceipt: string,
): MockValidateResult {
  const state = getApplicationsMockState();
  const current = findApplicationByIdOrRef(referenceCode);
  if (!current) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const now = new Date().toISOString();
  const application = {
    ...current,
    version: current.version + 1,
    financing: {
      ...current.financing,
      depositKes,
      depositPayment: {
        method,
        status: "verified" as const,
        verifiedAt: now,
        mpesaReceipt,
      },
    },
    timestamps: { ...current.timestamps, updatedAt: now },
  };
  state.byReferenceCode.set(application.referenceCode, application);

  return {
    ok: true,
    status: "verified",
    mpesaReceipt,
    depositPayment: application.financing?.depositPayment ?? null,
    applicationVersion: application.version,
  };
}

export function mockDepositValidate(body: unknown): MockValidateResult {
  const parsed = depositValidateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const ref = parsed.data.applicationReferenceCode;

  if (parsed.data.mpesaReceipt) {
    const receipt = parsed.data.mpesaReceipt.toUpperCase();
    if (receipt !== E2E_MPESA_RECEIPT && !receipt.startsWith("UG")) {
      return { ok: true, status: "failed", depositPayment: null };
    }
    const app = findApplicationByIdOrRef(ref);
    const depositKes = app?.financing?.depositKes ?? 10000;
    return applyVerifiedDeposit(ref, depositKes, "mpesa_code", receipt);
  }

  const checkoutId = parsed.data.checkoutId!;
  const record = getState().checkouts.get(checkoutId);
  if (!record || record.applicationReferenceCode !== ref) {
    return { ok: false, status: 404, error: "not_found" };
  }

  record.validateAttempts += 1;
  if (record.validateAttempts === 1) {
    return { ok: true, status: "pending", depositPayment: null };
  }

  record.status = "verified";
  return applyVerifiedDeposit(
    ref,
    record.depositKes,
    "stk",
    `UG${checkoutId.slice(-8).toUpperCase()}`,
  );
}
