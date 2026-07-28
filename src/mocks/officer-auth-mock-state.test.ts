import { afterEach, describe, expect, it } from "vitest";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
} from "@/lib/global/auth/demo-credentials";
import { normalizeEmail } from "@/lib/global/auth/normalize-email";
import {
  getOfficerAuthMockState,
  resetOfficerAuthMockState,
} from "@/mocks/officer-auth-mock-state";

describe("officer-auth-mock-state", () => {
  afterEach(() => {
    resetOfficerAuthMockState();
  });

  it("reset restores demo officer password after mutation", () => {
    const state = getOfficerAuthMockState();
    const email = normalizeEmail(DEMO_AGENT_EMAIL);
    const officer = state.officers.get(email);
    expect(officer?.password).toBe(DEMO_AGENT_PASSWORD);

    state.officers.set(email, {
      ...officer!,
      password: "SecureReset99",
    });
    expect(state.officers.get(email)?.password).toBe("SecureReset99");

    resetOfficerAuthMockState();
    expect(getOfficerAuthMockState().officers.get(email)?.password).toBe(
      DEMO_AGENT_PASSWORD,
    );
  });
});
