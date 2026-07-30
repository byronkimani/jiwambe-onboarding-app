import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import type { CustomerLookupMatch } from "@/lib/onboarding/application-resource";
import { deskCardToApplicationResource } from "@/lib/onboarding/desk-card-to-application-resource";
import { PORTAL_CUSTOMERS } from "@/lib/onboarding/fixtures/capture-fixtures";
import { getSeedApplications } from "@/lib/onboarding/fixtures/seed-applications";
import { DEFAULT_OFFICER } from "@/lib/onboarding/fixtures/seed-officer";
import { mapResourceToSummary } from "@/lib/onboarding/map-resource-to-summary";
import {
  createApplicationRequestSchema,
  patchApplicationRequestSchema,
  pauseApplicationRequestSchema,
  disqualifyApplicationRequestSchema,
  submitApplicationRequestSchema,
} from "@/lib/onboarding/schemas/application-schemas";
import { blockingIssuesForSubmit } from "@/lib/onboarding/application-submit-blocking";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";

export type ApplicationsMockState = {
  byReferenceCode: Map<string, OnboardingApplicationResource>;
  nextDraftNumber: number;
};

const GLOBAL_KEY = "__jiwambeOnboardingApplicationsMockState" as const;

function createApplicationsMockState(): ApplicationsMockState {
  const byReferenceCode = new Map<string, OnboardingApplicationResource>();
  for (const card of getSeedApplications()) {
    const resource = deskCardToApplicationResource(card);
    byReferenceCode.set(resource.referenceCode, resource);
  }
  return { byReferenceCode, nextDraftNumber: 2000 };
}

export function getApplicationsMockState(): ApplicationsMockState {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: ApplicationsMockState;
  };
  if (!globalStore[GLOBAL_KEY]) {
    globalStore[GLOBAL_KEY] = createApplicationsMockState();
  }
  return globalStore[GLOBAL_KEY];
}

export function resetApplicationsMockState(): void {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: ApplicationsMockState;
  };
  globalStore[GLOBAL_KEY] = createApplicationsMockState();
}

export function findApplicationByIdOrRef(
  idOrRef: string,
): OnboardingApplicationResource | undefined {
  const state = getApplicationsMockState();
  const direct = state.byReferenceCode.get(idOrRef);
  if (direct) return direct;
  for (const resource of state.byReferenceCode.values()) {
    if (resource.id === idOrRef) {
      return resource;
    }
  }
  return undefined;
}

const OFFICER_QUEUE_STATES = new Set([
  "OPS_REVIEW",
  "LMS_CREATED",
  "AGREEMENT_SIGNED",
  "READY_FOR_RELEASE",
]);

const HISTORY_STATES = new Set(["DISQUALIFIED", "ACTIVE_LOAN"]);

export function listApplicationSummaries(options?: {
  lifecycleState?: string | null;
  scope?: string | null;
}) {
  const state = getApplicationsMockState();
  let resources = [...state.byReferenceCode.values()];
  const lifecycleState = options?.lifecycleState ?? null;
  const scope = options?.scope ?? null;

  if (scope === "history") {
    resources = resources.filter((r) => HISTORY_STATES.has(r.lifecycleState));
  } else if (lifecycleState) {
    resources = resources.filter((r) => r.lifecycleState === lifecycleState);
  } else {
    resources = resources.filter((r) =>
      OFFICER_QUEUE_STATES.has(r.lifecycleState),
    );
  }
  return resources.map(mapResourceToSummary);
}

export type MockGetCurrentResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

/** Most recently updated DRAFT/PAUSED application for the demo officer. */
export function mockGetCurrentApplication(
  officerId: string = DEFAULT_OFFICER.id,
): MockGetCurrentResult {
  const state = getApplicationsMockState();
  const open = [...state.byReferenceCode.values()].filter(
    (r) =>
      (r.lifecycleState === "DRAFT" || r.lifecycleState === "PAUSED") &&
      r.assignment.officerId === officerId,
  );
  if (open.length === 0) {
    return { ok: false, status: 404, error: "not_found" };
  }
  const updatedAtMs = (resource: OnboardingApplicationResource) => {
    const ms = Date.parse(resource.timestamps.updatedAt);
    return Number.isFinite(ms) ? ms : 0;
  };
  open.sort((a, b) => {
    const byTime = updatedAtMs(b) - updatedAtMs(a);
    if (byTime !== 0) return byTime;
    return b.version - a.version;
  });
  return { ok: true, application: open[0] };
}

export type MockCreateResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

export function mockCreateApplication(body: unknown): MockCreateResult {
  const parsed = createApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const state = getApplicationsMockState();
  const ref = `A-${state.nextDraftNumber}`;
  state.nextDraftNumber += 1;
  const now = new Date().toISOString();
  const application: OnboardingApplicationResource = {
    id: `app_${ref.replace(/-/g, "_").toLowerCase()}`,
    referenceCode: ref,
    version: 1,
    lifecycleState: "DRAFT",
    pause: null,
    leadId: null,
    leadSource: null,
    assignment: {
      officerId: DEFAULT_OFFICER.id,
      officerDisplayName: DEFAULT_OFFICER.name,
      dealershipId: "hub_ruiru",
      dealershipName: DEFAULT_OFFICER.dealership,
    },
    readinessAttestations: {
      ...parsed.data.readinessAttestations,
      attestedAt: now,
    },
    customer: null,
    drivingLicence: null,
    goodConduct: null,
    references: null,
    operatingModel: null,
    financing: null,
    bikeAssignment: null,
    submission: { submittedAt: null, officerAttestation: false },
    operations: { lmsId: null, opsNote: null, flag: null },
    timestamps: { createdAt: now, updatedAt: now },
  };

  state.byReferenceCode.set(ref, application);
  return { ok: true, application };
}

export type MockPatchResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

function mergePatch(
  current: OnboardingApplicationResource,
  patch: Record<string, unknown>,
): OnboardingApplicationResource {
  const next = { ...current };
  for (const key of Object.keys(patch)) {
    if (key === "version") continue;
    const value = patch[key];
    if (value === undefined) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export function mockPatchApplication(
  idOrRef: string,
  body: unknown,
): MockPatchResult {
  const parsed = patchApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const current = findApplicationByIdOrRef(idOrRef);
  if (!current) {
    return { ok: false, status: 404, error: "not_found" };
  }

  if (parsed.data.version !== current.version) {
    return { ok: false, status: 409, error: "version_conflict" };
  }

  const { version, ...groups } = parsed.data;
  void version;
  const merged = mergePatch(current, groups as Record<string, unknown>);
  const now = new Date().toISOString();
  const application: OnboardingApplicationResource = {
    ...merged,
    version: current.version + 1,
    timestamps: { ...merged.timestamps, updatedAt: now },
  };

  getApplicationsMockState().byReferenceCode.set(
    application.referenceCode,
    application,
  );
  return { ok: true, application };
}

export type MockPauseResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

export function mockPauseApplication(
  idOrRef: string,
  body: unknown,
): MockPauseResult {
  const parsed = pauseApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const current = findApplicationByIdOrRef(idOrRef);
  if (!current) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const now = new Date().toISOString();
  const application: OnboardingApplicationResource = {
    ...current,
    lifecycleState: "PAUSED",
    version: current.version + 1,
    pause: {
      reason: parsed.data.reason,
      pausedAt: now,
      pausedByOfficerId: DEFAULT_OFFICER.id,
    },
    bikeAssignment: null,
    timestamps: { ...current.timestamps, updatedAt: now },
  };

  getApplicationsMockState().byReferenceCode.set(
    application.referenceCode,
    application,
  );
  return { ok: true, application };
}

export type MockSubmitResult =
  | { ok: true; application: OnboardingApplicationResource }
  | {
      ok: false;
      status: number;
      error: string;
      blockingIssues?: { code: string; message: string }[];
    };

export function mockSubmitApplication(
  idOrRef: string,
  body: unknown,
): MockSubmitResult {
  const parsed = submitApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const current = findApplicationByIdOrRef(idOrRef);
  if (!current) {
    return { ok: false, status: 404, error: "not_found" };
  }

  if (
    current.lifecycleState !== "DRAFT" &&
    current.lifecycleState !== "PAUSED"
  ) {
    return { ok: false, status: 409, error: "invalid_state" };
  }

  const blockingIssues = blockingIssuesForSubmit(current);
  if (blockingIssues.length > 0) {
    return {
      ok: false,
      status: 422,
      error: "validation_failed",
      blockingIssues,
    };
  }

  const now = new Date().toISOString();
  const application: OnboardingApplicationResource = {
    ...current,
    lifecycleState: "OPS_REVIEW",
    version: current.version + 1,
    pause: null,
    submission: {
      submittedAt: now,
      officerAttestation: true,
    },
    timestamps: { ...current.timestamps, updatedAt: now },
  };

  getApplicationsMockState().byReferenceCode.set(
    application.referenceCode,
    application,
  );
  return { ok: true, application };
}

export type MockDisqualifyResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

const DISQUALIFY_ALLOWED: OnboardingApplicationResource["lifecycleState"][] = [
  "DRAFT",
  "PAUSED",
];

export function mockDisqualifyApplication(
  idOrRef: string,
  body: unknown,
): MockDisqualifyResult {
  const parsed = disqualifyApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "invalid_body" };
  }

  const current = findApplicationByIdOrRef(idOrRef);
  if (!current) {
    return { ok: false, status: 404, error: "not_found" };
  }

  if (!DISQUALIFY_ALLOWED.includes(current.lifecycleState)) {
    return { ok: false, status: 409, error: "invalid_state" };
  }

  const now = new Date().toISOString();
  const application: OnboardingApplicationResource = {
    ...current,
    lifecycleState: "DISQUALIFIED",
    version: current.version + 1,
    pause: null,
    bikeAssignment: null,
    operations: {
      ...current.operations,
      opsNote: parsed.data.reason,
    },
    timestamps: { ...current.timestamps, updatedAt: now },
  };

  getApplicationsMockState().byReferenceCode.set(
    application.referenceCode,
    application,
  );
  return { ok: true, application };
}

function maskNationalIdForDisplay(idNo: string): string {
  const digits = normalizeNationalIdDigits(idNo);
  if (digits.length <= 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

function maskPhoneForDisplay(phone: string): string {
  const parsed = parseKenyaPhoneForSubmit(phone);
  if (!parsed.ok) return phone;
  const national = `0${parsed.wire.slice(3)}`;
  return `${national.slice(0, 4)}•• ••• ${national.slice(-3)}`;
}

export type MockLookupResult =
  | { ok: true; matches: CustomerLookupMatch[] }
  | { ok: false; status: number; error: string };

export function mockCustomerLookup(body: {
  phone?: string;
  nationalId?: string;
}): MockLookupResult {
  const matches: CustomerLookupMatch[] = [];

  for (const customer of PORTAL_CUSTOMERS) {
    let phoneMatch = false;
    let nidMatch = false;

    if (body.phone) {
      const query = parseKenyaPhoneForSubmit(body.phone);
      const candidate = parseKenyaPhoneForSubmit(customer.phone);
      if (query.ok && candidate.ok && query.wire === candidate.wire) {
        phoneMatch = true;
      }
    }

    if (body.nationalId) {
      const queryDigits = normalizeNationalIdDigits(body.nationalId);
      const customerDigits = normalizeNationalIdDigits(customer.idNo);
      if (queryDigits && queryDigits === customerDigits) {
        nidMatch = true;
      }
    }

    if (phoneMatch || nidMatch) {
      matches.push({
        leadId: `lead_${customer.idNo.replace(/\s/g, "")}`,
        source: "PORTAL",
        displayName: customer.name,
        phoneMasked: maskPhoneForDisplay(customer.phone),
        nationalIdMasked: maskNationalIdForDisplay(customer.idNo),
      });
    }
  }

  return { ok: true, matches };
}
