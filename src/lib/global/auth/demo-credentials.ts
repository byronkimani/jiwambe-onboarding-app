/** Documented demo officer login — matches `docs/prototype/js/auth.js`. */
export const DEMO_AGENT_EMAIL = "jane.ochieng@contractor.jiwambe.com";
export const DEMO_AGENT_PASSWORD = "demopass1";
export const DEMO_OTP_CODE = "123456";
/** Mask shown on OTP screen (prototype copy). */
export const DEMO_OTP_PHONE_MASK = "07•• ••• 118";

/** Upstream MSW login still keys on agent phone. */
export const DEMO_AGENT_PHONE_DISPLAY = "0700 100 000";
export const DEMO_AGENT_PHONE_NATIONAL = "0700100000";

export function isValidOfficerEmail(email: string): boolean {
  return /.+@.+\..+/.test(email.trim());
}

export function isValidOfficerPassword(password: string): boolean {
  return password.length >= 8;
}
