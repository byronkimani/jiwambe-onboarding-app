import { describe, expect, it } from "vitest";
import {
  AppRoutes,
  captureStage,
  deskApplication,
  deskApplicationAgreement,
  isCapturePath,
  isCaptureStageKey,
  isDeskPath,
  isProtectedPath,
  isProtectedApiPath,
  isPublicApiOnboardingPath,
  isPublicPath,
} from "./routes";

describe("routes", () => {
  it("exposes expected public paths", () => {
    expect(isPublicPath(AppRoutes.home)).toBe(true);
    expect(isPublicPath(AppRoutes.activate)).toBe(true);
    expect(isPublicPath(AppRoutes.forgotPassword)).toBe(true);
    expect(isPublicPath(AppRoutes.resetPassword)).toBe(true);
    expect(isPublicPath(AppRoutes.offline)).toBe(true);
    expect(isPublicPath(AppRoutes.accountBlocked)).toBe(true);
    expect(isPublicPath(AppRoutes.desk)).toBe(false);
    expect(isPublicPath(AppRoutes.capture)).toBe(false);
  });

  it("treats desk and capture as protected", () => {
    expect(isProtectedPath(AppRoutes.desk)).toBe(true);
    expect(isDeskPath(AppRoutes.deskHistory)).toBe(true);
    expect(isCapturePath(captureStage("identity"))).toBe(true);
    expect(isProtectedPath(captureStage("review"))).toBe(true);
  });

  it("builds desk and capture URLs", () => {
    expect(deskApplication("A-1042")).toBe("/desk/applications/A-1042");
    expect(deskApplicationAgreement("A-1042")).toBe(
      "/desk/applications/A-1042/agreement",
    );
    expect(captureStage("readiness")).toBe("/capture/readiness");
  });

  it("validates capture stage keys", () => {
    expect(isCaptureStageKey("identity")).toBe(true);
    expect(isCaptureStageKey("invalid")).toBe(false);
  });

  it("keeps protected onboarding APIs private", () => {
    expect(isPublicApiOnboardingPath(AppRoutes.apiOnboardingApplications)).toBe(
      false,
    );
    expect(isProtectedApiPath(AppRoutes.apiCatalogQuotes)).toBe(true);
    expect(isProtectedApiPath(AppRoutes.apiCustomersSearch)).toBe(true);
    expect(isProtectedApiPath(AppRoutes.apiPaymentsStk)).toBe(true);
    expect(isPublicApiOnboardingPath(AppRoutes.apiOnboardingAuthLogin)).toBe(
      true,
    );
    expect(isPublicApiOnboardingPath(AppRoutes.apiOnboardingAuthOtpResend)).toBe(
      true,
    );
    expect(isPublicApiOnboardingPath(AppRoutes.apiOnboardingLogout)).toBe(false);
    expect(
      isPublicApiOnboardingPath(AppRoutes.apiOnboardingAuthPasswordForgot),
    ).toBe(true);
    expect(
      isPublicApiOnboardingPath(AppRoutes.apiOnboardingAuthPasswordReset),
    ).toBe(true);
    expect(
      isPublicApiOnboardingPath(
        AppRoutes.apiOnboardingAuthPasswordResetPassword,
      ),
    ).toBe(true);
    expect(isPublicApiOnboardingPath(AppRoutes.apiOnboardingE2eResetMocks)).toBe(
      true,
    );
  });
});
