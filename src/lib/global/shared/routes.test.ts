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
  isPublicPath,
} from "./routes";

describe("routes", () => {
  it("exposes expected public paths", () => {
    expect(isPublicPath(AppRoutes.home)).toBe(true);
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
});
