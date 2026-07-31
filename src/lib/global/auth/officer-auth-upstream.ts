import { normalizeEmail } from "@/lib/global/auth/normalize-email";
import { OFFICER_AUTH_UPSTREAM } from "@/lib/global/auth/officer-auth-paths";
import { officerAuthUpstreamOptions } from "@/lib/global/auth/officer-auth-upstream-options";
import { upstreamRequest } from "@/lib/global/shared/upstream-request";

export type UpstreamErrorBody = {
  error?: string;
  message?: string;
  retries_remaining?: number;
  retry_after_seconds?: number;
};

export type OtpVerifySuccess = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  officer: { email: string; name: string };
};

export async function upstreamOfficerLogin(
  email: string,
  password: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.login,
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
      }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerOtpVerify(
  otpSessionId: string,
  code: string,
): Promise<Response> {
  return upstreamRequest(OFFICER_AUTH_UPSTREAM.otpVerify, {
    method: "POST",
    body: JSON.stringify({
      otp_session_id: otpSessionId,
      code,
    }),
  });
}

export async function upstreamOfficerActivate(
  token: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.activate,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerActivatePassword(
  activationSessionId: string,
  password: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.activatePassword,
    {
      method: "POST",
      body: JSON.stringify({
        activation_session_id: activationSessionId,
        password,
      }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerPasswordForgot(
  email: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.passwordForgot,
    {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email) }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerPasswordReset(
  token: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.passwordReset,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerPasswordResetPassword(
  resetSessionId: string,
  password: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.passwordResetPassword,
    {
      method: "POST",
      body: JSON.stringify({
        reset_session_id: resetSessionId,
        password,
      }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerPasswordChange(
  accessToken: string,
  currentPassword: string,
  password: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.passwordChange,
    {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        password,
      }),
    },
    officerAuthUpstreamOptions(request, { accessToken }),
  );
}

export async function upstreamOfficerOtpResend(
  otpSessionId: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.otpResend,
    {
      method: "POST",
      body: JSON.stringify({ otp_session_id: otpSessionId }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerLogout(
  refreshToken: string,
  request?: Request,
): Promise<Response> {
  return upstreamRequest(
    OFFICER_AUTH_UPSTREAM.logout,
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    officerAuthUpstreamOptions(request),
  );
}

export async function upstreamOfficerRefresh(
  refreshToken: string,
): Promise<Response> {
  return upstreamRequest(OFFICER_AUTH_UPSTREAM.refresh, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function parseUpstreamJson<T>(
  response: Response,
): Promise<T & UpstreamErrorBody> {
  return (await response.json().catch(() => ({}))) as T & UpstreamErrorBody;
}

const DEFAULT_EXPIRES_IN_SEC = 3600;

export function accessTokenExpiresAtMs(expiresInSec?: number): number {
  const sec = expiresInSec ?? DEFAULT_EXPIRES_IN_SEC;
  return Date.now() + sec * 1000;
}

const REFRESH_SKEW_MS = 60_000;

export function accessTokenNeedsRefresh(expiresAtMs: number | undefined): boolean {
  if (!expiresAtMs) return true;
  return Date.now() >= expiresAtMs - REFRESH_SKEW_MS;
}

export async function refreshOfficerTokens(refreshToken: string): Promise<
  | { ok: true; accessToken: string; refreshToken: string; accessTokenExpiresAt: number }
  | { ok: false }
> {
  const response = await upstreamOfficerRefresh(refreshToken);
  if (!response.ok) return { ok: false };
  const data = await parseUpstreamJson<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }>(response);
  if (!data.access_token) return { ok: false };
  return {
    ok: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    accessTokenExpiresAt: accessTokenExpiresAtMs(data.expires_in),
  };
}
