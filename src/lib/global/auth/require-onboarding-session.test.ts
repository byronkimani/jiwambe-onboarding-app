import { describe, expect, it } from "vitest";
import { isOnboardingSession } from "./onboarding-session";

describe("isOnboardingSession", () => {
  it("accepts session with agentId", () => {
    expect(
      isOnboardingSession({
        user: { name: "Jane" },
        agentId: "fo-12",
        expires: "",
      }),
    ).toBe(true);
  });

  it("accepts session with user email when id missing", () => {
    expect(
      isOnboardingSession({
        user: { email: "jane@example.com" },
        expires: "",
      }),
    ).toBe(true);
  });

  it("rejects refresh error session", () => {
    expect(
      isOnboardingSession({
        user: { id: "x" },
        error: "RefreshError",
        expires: "",
      }),
    ).toBe(false);
  });
});
