import { createHmac, timingSafeEqual } from "node:crypto";

export const ACTIVATION_SESSION_COOKIE = "jiwambe_onboarding_activation_session";
export const RESET_SESSION_COOKIE = "jiwambe_onboarding_reset_session";

const ACTIVATION_MAX_AGE_SEC = 30 * 60;
const RESET_MAX_AGE_SEC = 30 * 60;

function cookieSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return secret;
}

function signPayload(payload: string): string {
  const sig = createHmac("sha256", cookieSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifySigned(value: string): string | null {
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expected = createHmac("sha256", cookieSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return payload;
}

function encodeJson<T>(data: T): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

function decodeJson<T>(encoded: string): T | null {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export type ActivationSessionPayload = {
  activation_session_id: string;
  email_masked: string;
  exp: number;
};

export type ResetSessionPayload = {
  reset_session_id: string;
  email_masked: string;
  exp: number;
};

export function buildActivationSessionCookieValue(
  activationSessionId: string,
  emailMasked: string,
): string {
  const payload = encodeJson<ActivationSessionPayload>({
    activation_session_id: activationSessionId,
    email_masked: emailMasked,
    exp: Math.floor(Date.now() / 1000) + ACTIVATION_MAX_AGE_SEC,
  });
  return signPayload(payload);
}

export function parseActivationSessionCookie(
  cookieValue: string | undefined,
): ActivationSessionPayload | null {
  if (!cookieValue) return null;
  const payload = verifySigned(cookieValue);
  if (!payload) return null;
  const data = decodeJson<ActivationSessionPayload>(payload);
  if (!data || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

export function buildResetSessionCookieValue(
  resetSessionId: string,
  emailMasked: string,
): string {
  const payload = encodeJson<ResetSessionPayload>({
    reset_session_id: resetSessionId,
    email_masked: emailMasked,
    exp: Math.floor(Date.now() / 1000) + RESET_MAX_AGE_SEC,
  });
  return signPayload(payload);
}

export function parseResetSessionCookie(
  cookieValue: string | undefined,
): ResetSessionPayload | null {
  if (!cookieValue) return null;
  const payload = verifySigned(cookieValue);
  if (!payload) return null;
  const data = decodeJson<ResetSessionPayload>(payload);
  if (!data || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

export function cookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export const activationCookieOptions = () =>
  cookieOptions(ACTIVATION_MAX_AGE_SEC);

export const resetCookieOptions = () => cookieOptions(RESET_MAX_AGE_SEC);

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
