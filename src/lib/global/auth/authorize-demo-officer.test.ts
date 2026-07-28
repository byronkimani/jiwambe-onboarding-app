import { describe, expect, it } from "vitest";
import { buildDemoOfficerAuthUser } from "@/lib/global/auth/authorize-demo-officer";
import { DEMO_AGENT_EMAIL } from "@/lib/global/auth/demo-credentials";

describe("buildDemoOfficerAuthUser", () => {
  it("returns seeded officer with mock tokens", () => {
    const user = buildDemoOfficerAuthUser(DEMO_AGENT_EMAIL);
    expect(user.email).toBe(DEMO_AGENT_EMAIL);
    expect(user.name).toBe("Jane Ochieng");
    expect(user.backendAccessToken).toMatch(/^mock_onboarding_access_/);
  });
});
