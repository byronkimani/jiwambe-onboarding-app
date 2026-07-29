/**
 * Central dictionary for application routes.
 * Use AppRoutes and helpers instead of hardcoded URL strings.
 */
export const CAPTURE_STAGE_KEYS = [
  "readiness",
  "lookup",
  "identity",
  "dl",
  "cogc",
  "references",
  "model",
  "product",
  "bike",
  "review",
] as const;

export type CaptureStageKey = (typeof CAPTURE_STAGE_KEYS)[number];

export const AppRoutes = {
  home: "/",
  activate: "/activate",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  offline: "/offline",
  accountBlocked: "/account-blocked",
  desk: "/desk",
  deskHistory: "/desk/history",
  deskDrafts: "/desk/drafts",
  deskProfile: "/desk/profile",
  capture: "/capture",
  apiAuth: "/api/auth",
  apiOnboardingHealth: "/api/onboarding/health",
  apiOnboardingAuthLogin: "/api/onboarding/auth/login",
  apiOnboardingAuthOtpResend: "/api/onboarding/auth/otp/resend",
  apiOnboardingAuthActivate: "/api/onboarding/auth/activate",
  apiOnboardingAuthActivatePassword: "/api/onboarding/auth/activate/password",
  apiOnboardingAuthPasswordForgot: "/api/onboarding/auth/password/forgot",
  apiOnboardingAuthPasswordReset: "/api/onboarding/auth/password/reset",
  apiOnboardingAuthPasswordResetPassword:
    "/api/onboarding/auth/password/reset/password",
  apiOnboardingLogout: "/api/onboarding/logout",
  apiOnboardingApplications: "/api/onboarding/applications",
  apiOnboardingApplicationsCurrent: "/api/onboarding/applications/current",
  apiOnboardingCatalogProducts: "/api/onboarding/catalog/products",
  apiOnboardingCatalogQuotes: "/api/onboarding/catalog/quotes",
  apiOnboardingCustomersLookup: "/api/onboarding/customers/lookup",
  apiOnboardingInventory: "/api/onboarding/inventory",
  apiOnboardingDepositStk: "/api/onboarding/deposits/stk",
  apiOnboardingDepositValidate: "/api/onboarding/deposits/validate",
  apiOnboardingE2eResetMocks: "/api/onboarding/e2e/reset-mocks",
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

export function captureStage(
  stage: CaptureStageKey,
  applicationRef?: string,
): string {
  const base = `${AppRoutes.capture}/${stage}`;
  if (!applicationRef?.trim()) {
    return base;
  }
  const params = new URLSearchParams({ application: applicationRef.trim() });
  return `${base}?${params.toString()}`;
}

export function deskApplication(id: string): string {
  return `/desk/applications/${encodeURIComponent(id)}`;
}

export function deskApplicationAgreement(id: string): string {
  return `${deskApplication(id)}/agreement`;
}

export function deskApplicationRelease(id: string): string {
  return `${deskApplication(id)}/release`;
}

export function deskApplicationSummary(id: string): string {
  return `${deskApplication(id)}/summary`;
}

export function apiOnboardingApplication(id: string): string {
  return `${AppRoutes.apiOnboardingApplications}/${encodeURIComponent(id)}`;
}

export function apiOnboardingApplicationPause(id: string): string {
  return `${apiOnboardingApplication(id)}/pause`;
}

export function apiOnboardingApplicationDisqualify(id: string): string {
  return `${apiOnboardingApplication(id)}/disqualify`;
}

export function apiOnboardingApplicationSubmit(id: string): string {
  return `${apiOnboardingApplication(id)}/submit`;
}

export function apiOnboardingApplicationAgreement(id: string): string {
  return `${apiOnboardingApplication(id)}/agreement`;
}

export function apiOnboardingApplicationRelease(id: string): string {
  return `${apiOnboardingApplication(id)}/release`;
}

export function apiOnboardingApplicationReleaseOtp(id: string): string {
  return `${apiOnboardingApplication(id)}/release/otp`;
}

export const PUBLIC_PATHS = [
  AppRoutes.home,
  AppRoutes.activate,
  AppRoutes.forgotPassword,
  AppRoutes.resetPassword,
  AppRoutes.offline,
  AppRoutes.accountBlocked,
] as const;

export const PUBLIC_API_ONBOARDING_PATHS = [
  AppRoutes.apiOnboardingHealth,
  AppRoutes.apiOnboardingAuthLogin,
  AppRoutes.apiOnboardingAuthOtpResend,
  AppRoutes.apiOnboardingAuthActivate,
  AppRoutes.apiOnboardingAuthActivatePassword,
  AppRoutes.apiOnboardingAuthPasswordForgot,
  AppRoutes.apiOnboardingAuthPasswordReset,
  AppRoutes.apiOnboardingAuthPasswordResetPassword,
  AppRoutes.apiOnboardingE2eResetMocks,
] as const;

export const DESK_PATH_PREFIX = "/desk" as const;
export const CAPTURE_PATH_PREFIX = "/capture" as const;

export const PROTECTED_PATH_PREFIXES = [
  DESK_PATH_PREFIX,
  CAPTURE_PATH_PREFIX,
] as const;

export function isCaptureStageKey(value: string): value is CaptureStageKey {
  return (CAPTURE_STAGE_KEYS as readonly string[]).includes(value);
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }
  if (pathname.startsWith(`${AppRoutes.apiAuth}/`)) {
    return true;
  }
  return false;
}

export function isDeskPath(pathname: string): boolean {
  return pathname === DESK_PATH_PREFIX || pathname.startsWith(`${DESK_PATH_PREFIX}/`);
}

export function isCapturePath(pathname: string): boolean {
  return pathname === CAPTURE_PATH_PREFIX || pathname.startsWith(`${CAPTURE_PATH_PREFIX}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isApiOnboardingPath(pathname: string): boolean {
  return pathname.startsWith("/api/onboarding");
}

export function isPublicApiOnboardingPath(pathname: string): boolean {
  return PUBLIC_API_ONBOARDING_PATHS.includes(
    pathname as (typeof PUBLIC_API_ONBOARDING_PATHS)[number],
  );
}
