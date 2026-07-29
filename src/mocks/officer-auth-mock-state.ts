import {
  DEMO_ACTIVATION_TOKEN,
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_PENDING_AGENT_EMAIL,
  DEMO_RESET_TOKEN,
} from "@/lib/global/auth/demo-credentials";
import { normalizeEmail } from "@/lib/global/auth/normalize-email";

export type OfficerRecord = {
  email: string;
  password: string;
  name: string;
  maskedPhone: string;
  blocked: boolean;
};

export type OtpSessionRecord = {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  resendAvailableAt: number;
};

export type TimedEmailSession = { email: string; expiresAt: number };

export type OfficerAuthMockState = {
  officers: Map<string, OfficerRecord>;
  otpSessions: Map<string, OtpSessionRecord>;
  activationSessions: Map<string, TimedEmailSession>;
  resetSessions: Map<string, TimedEmailSession>;
  pendingActivationTokens: Map<string, string>;
  pendingResetTokens: Map<string, string>;
  refreshTokens: Map<string, string>;
};

const GLOBAL_KEY = "__jiwambeOnboardingOfficerAuthMockState" as const;

function createOfficerAuthMockState(): OfficerAuthMockState {
  return {
    officers: new Map([
      [
        normalizeEmail(DEMO_AGENT_EMAIL),
        {
          email: normalizeEmail(DEMO_AGENT_EMAIL),
          password: DEMO_AGENT_PASSWORD,
          name: "John",
          maskedPhone: "07•• ••• 118",
          blocked: false,
        },
      ],
    ]),
    otpSessions: new Map(),
    activationSessions: new Map(),
    resetSessions: new Map(),
    pendingActivationTokens: new Map([
      [DEMO_ACTIVATION_TOKEN, normalizeEmail(DEMO_PENDING_AGENT_EMAIL)],
    ]),
    pendingResetTokens: new Map([
      [DEMO_RESET_TOKEN, normalizeEmail(DEMO_AGENT_EMAIL)],
    ]),
    refreshTokens: new Map(),
  };
}

/** Single in-memory store shared by MSW handlers and E2E reset (survives duplicate bundles). */
export function getOfficerAuthMockState(): OfficerAuthMockState {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: OfficerAuthMockState;
  };
  if (!globalStore[GLOBAL_KEY]) {
    globalStore[GLOBAL_KEY] = createOfficerAuthMockState();
  }
  return globalStore[GLOBAL_KEY];
}

export function resetOfficerAuthMockState(): void {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: OfficerAuthMockState;
  };
  globalStore[GLOBAL_KEY] = createOfficerAuthMockState();
}
