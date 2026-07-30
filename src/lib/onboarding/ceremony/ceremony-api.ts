import { bffFetch } from "@/lib/global/client/bff-fetch";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import {
  apiOnboardingApplicationAgreement,
  apiOnboardingApplicationRelease,
  apiOnboardingApplicationReleaseOtp,
} from "@/lib/global/shared/routes";
import type {
  AgreementActionRequest,
  ReleaseCompleteRequest,
} from "@/lib/onboarding/schemas/ceremony-schemas";
import { parseApplicationResource } from "@/lib/onboarding/schemas/parse-onboarding-json";

async function parseApplicationResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as {
    application?: OnboardingApplicationResource;
    message?: string;
    error?: string;
  };

  if (!response.ok || !body.application) {
    return {
      ok: false as const,
      status: response.status,
      message: body.message ?? "Request failed.",
    };
  }

  const parsed = parseApplicationResource({ application: body.application });
  if (!parsed.ok) {
    return {
      ok: false as const,
      status: 502,
      message: "Invalid application response.",
    };
  }

  return { ok: true as const, application: parsed.data };
}

export async function apiAgreementAction(
  idOrRef: string,
  body: AgreementActionRequest,
) {
  const response = await bffFetch(apiOnboardingApplicationAgreement(idOrRef), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseApplicationResponse(response);
}

export async function apiReleaseSendOtp(idOrRef: string) {
  const response = await bffFetch(apiOnboardingApplicationReleaseOtp(idOrRef), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send" }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    return {
      ok: false as const,
      message: body.message ?? "Could not send OTP.",
    };
  }

  return { ok: true as const };
}

export async function apiReleaseComplete(
  idOrRef: string,
  body: ReleaseCompleteRequest,
) {
  const response = await bffFetch(apiOnboardingApplicationRelease(idOrRef), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseApplicationResponse(response);
}
