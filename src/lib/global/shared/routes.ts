/**
 * Central dictionary for application routes.
 * Use AppRoutes / FieldRoutes and helpers instead of hardcoded URL strings.
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

const FIELD_PREFIX = "/v1/field" as const;

/** Field-realm BFF paths — mirror upstream `/v1/field/*`. */
export const FieldRoutes = {
  applications: `${FIELD_PREFIX}/applications`,
  applicationsCurrent: `${FIELD_PREFIX}/applications/current`,
  authMe: `${FIELD_PREFIX}/auth/me`,
  authLogout: `${FIELD_PREFIX}/auth/logout`,
  customersSearch: `${FIELD_PREFIX}/customers/search`,
  products: `${FIELD_PREFIX}/products`,
  productsQuote: `${FIELD_PREFIX}/products/quote`,
  productsPricingRules: `${FIELD_PREFIX}/products/pricing-rules`,
  bikesAssignable: `${FIELD_PREFIX}/bikes/assignable`,
  paymentsStk: `${FIELD_PREFIX}/payments/stk`,
  paymentsValidate: `${FIELD_PREFIX}/payments/validate`,
} as const;

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
  apiOnboardingAuthPasswordChange: "/api/onboarding/auth/password/change",
  apiOnboardingMockDocumentUpload: "/api/onboarding/mock/documents",
  apiOnboardingE2eResetMocks: "/api/onboarding/e2e/reset-mocks",
  apiOnboardingDevResetMocks: "/api/onboarding/dev/reset-mocks",
  ...FieldRoutes,
} as const;

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

export function fieldApplication(id: string): string {
  return `${FieldRoutes.applications}/${encodeURIComponent(id)}`;
}

export function fieldApplicationPause(id: string): string {
  return `${fieldApplication(id)}/pause`;
}

export function fieldApplicationDisqualify(id: string): string {
  return `${fieldApplication(id)}/disqualify`;
}

export function fieldApplicationSubmit(id: string): string {
  return `${fieldApplication(id)}/submit`;
}

export function apiOnboardingMockDocumentUpload(documentId: string): string {
  return `${AppRoutes.apiOnboardingMockDocumentUpload}/${encodeURIComponent(documentId)}/upload`;
}

export function fieldApplicationDocumentInit(id: string): string {
  return `${fieldApplication(id)}/documents/init`;
}

export function fieldApplicationDocumentComplete(
  id: string,
  documentId: string,
): string {
  return `${fieldApplication(id)}/documents/${encodeURIComponent(documentId)}/complete`;
}

export function fieldApplicationAgreement(id: string): string {
  return `${fieldApplication(id)}/agreement`;
}

export function fieldApplicationRelease(id: string): string {
  return `${fieldApplication(id)}/release`;
}

export function fieldApplicationReleaseOtp(id: string): string {
  return `${fieldApplication(id)}/release/otp`;
}

/** @deprecated Use fieldApplication */
export const apiOnboardingApplication = fieldApplication;
/** @deprecated Use fieldApplicationPause */
export const apiOnboardingApplicationPause = fieldApplicationPause;
/** @deprecated Use fieldApplicationDisqualify */
export const apiOnboardingApplicationDisqualify = fieldApplicationDisqualify;
/** @deprecated Use fieldApplicationSubmit */
export const apiOnboardingApplicationSubmit = fieldApplicationSubmit;
/** @deprecated Use fieldApplicationDocumentInit */
export const apiOnboardingApplicationDocumentInit = fieldApplicationDocumentInit;
/** @deprecated Use fieldApplicationDocumentComplete */
export const apiOnboardingApplicationDocumentComplete =
  fieldApplicationDocumentComplete;
/** @deprecated Use fieldApplicationAgreement */
export const apiOnboardingApplicationAgreement = fieldApplicationAgreement;
/** @deprecated Use fieldApplicationRelease */
export const apiOnboardingApplicationRelease = fieldApplicationRelease;
/** @deprecated Use fieldApplicationReleaseOtp */
export const apiOnboardingApplicationReleaseOtp = fieldApplicationReleaseOtp;

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
  AppRoutes.apiOnboardingDevResetMocks,
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

const PROTECTED_API_PREFIXES = [FIELD_PREFIX] as const;

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPublicApiOnboardingPath(pathname: string): boolean {
  return PUBLIC_API_ONBOARDING_PATHS.includes(
    pathname as (typeof PUBLIC_API_ONBOARDING_PATHS)[number],
  );
}
