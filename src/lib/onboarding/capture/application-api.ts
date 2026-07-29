import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import type { CustomerLookupMatch } from "@/lib/onboarding/application-resource";
import {
  AppRoutes,
  apiOnboardingApplication,
  apiOnboardingApplicationPause,
  apiOnboardingApplicationSubmit,
  apiOnboardingApplicationDisqualify,
} from "@/lib/global/shared/routes";
import { createApplicationRequestSchema } from "@/lib/onboarding/schemas/application-schemas";

export async function apiCreateApplication(body: {
  readinessAttestations: {
    hasId: true;
    knowsKra: true;
    dlKnown: true;
    cogcKnown: true;
    hasFunds: true;
    refsBriefed: true;
  };
}): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const parsed = createApplicationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Invalid application data." };
  }

  const response = await fetch(AppRoutes.apiOnboardingApplications, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(parsed.data),
  });

  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
    error?: string;
  };

  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not create application.",
    };
  }

  return { ok: true, application: data.application };
}

export async function apiPatchApplication(
  idOrRef: string,
  body: Record<string, unknown>,
): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(apiOnboardingApplication(idOrRef), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
    error?: string;
  };

  if (response.status === 409) {
    return {
      ok: false,
      status: 409,
      message: "Application was updated elsewhere. Refresh and try again.",
    };
  }

  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not save application.",
    };
  }

  return { ok: true, application: data.application };
}

export async function apiCustomerLookup(body: {
  phone?: string;
  nationalId?: string | null;
}): Promise<
  | { ok: true; matches: CustomerLookupMatch[] }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(AppRoutes.apiOnboardingCustomersLookup, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    matches?: CustomerLookupMatch[];
    message?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Lookup failed.",
    };
  }

  return { ok: true, matches: data.matches ?? [] };
}

export async function apiFetchApplication(
  idOrRef: string,
): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(apiOnboardingApplication(idOrRef), {
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
  };
  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not load application.",
    };
  }
  return { ok: true, application: data.application };
}

export async function apiPauseApplication(
  idOrRef: string,
  body: { reason: string },
): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(apiOnboardingApplicationPause(idOrRef), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
  };

  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not pause application.",
    };
  }

  return { ok: true, application: data.application };
}

export type SubmitBlockingIssue = { code: string; message: string };

export async function apiSubmitApplication(
  idOrRef: string,
  body: { officerAttestation?: true } = {},
): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | {
      ok: false;
      status: number;
      message: string;
      blockingIssues?: SubmitBlockingIssue[];
    }
> {
  const response = await fetch(apiOnboardingApplicationSubmit(idOrRef), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
    blockingIssues?: SubmitBlockingIssue[];
    error?: string;
  };

  if (response.status === 422) {
    return {
      ok: false,
      status: 422,
      message: "Complete all required sections before submit.",
      blockingIssues: data.blockingIssues,
    };
  }

  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not submit application.",
    };
  }

  return { ok: true, application: data.application };
}

export async function apiDisqualifyApplication(
  idOrRef: string,
  body: { reason: string },
): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(apiOnboardingApplicationDisqualify(idOrRef), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
  };

  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not disqualify application.",
    };
  }

  return { ok: true, application: data.application };
}

export async function apiFetchCurrentApplication(): Promise<
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(AppRoutes.apiOnboardingApplicationsCurrent, {
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
  };
  if (response.status === 404) {
    return { ok: false, status: 404, message: "No open application." };
  }
  if (!response.ok || !data.application) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "Could not load current application.",
    };
  }
  return { ok: true, application: data.application };
}

export async function apiDepositStk(body: {
  applicationReferenceCode: string;
  depositKes: number;
  phone?: string;
}): Promise<
  | {
      ok: true;
      checkoutId: string;
      status: "initiated" | "waiting";
      expiresAt?: string;
    }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(AppRoutes.apiOnboardingDepositStk, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    checkoutId?: string;
    status?: "initiated" | "waiting";
    expiresAt?: string;
    error?: string;
  };
  if (!response.ok || !data.checkoutId) {
    return {
      ok: false,
      status: response.status,
      message: "Could not start M-Pesa payment.",
    };
  }
  return {
    ok: true,
    checkoutId: data.checkoutId,
    status: data.status ?? "waiting",
    expiresAt: data.expiresAt,
  };
}

export async function apiDepositValidate(body: {
  applicationReferenceCode: string;
  checkoutId?: string;
  mpesaReceipt?: string;
}): Promise<
  | {
      ok: true;
      status: "verified" | "failed" | "pending";
      mpesaReceipt?: string | null;
      applicationVersion?: number;
    }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(AppRoutes.apiOnboardingDepositValidate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    status?: "verified" | "failed" | "pending";
    mpesaReceipt?: string | null;
    applicationVersion?: number;
    error?: string;
  };
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: "Could not verify deposit.",
    };
  }
  return {
    ok: true,
    status: data.status ?? "failed",
    mpesaReceipt: data.mpesaReceipt,
    applicationVersion: data.applicationVersion,
  };
}
