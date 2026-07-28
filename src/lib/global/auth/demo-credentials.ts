import { isValidEmailFormat } from "@/lib/global/auth/normalize-email";

export const DEMO_AGENT_EMAIL = "john@jiwambe.com";
export const DEMO_AGENT_PASSWORD = "demo12345";
export const DEMO_OTP_CODE = "123456";
export const DEMO_ACTIVATION_TOKEN = "demo-activate-token";
export const DEMO_PENDING_AGENT_EMAIL = "pending.agent@contractor.jiwambe.com";
export const DEMO_RESET_TOKEN = "demo-reset-token";

/** @deprecated Prefer `isValidEmailFormat` from normalize-email */
export function isValidOfficerEmail(email: string): boolean {
  return isValidEmailFormat(email);
}

export function isValidOfficerPassword(password: string): boolean {
  return password.length >= 8;
}
