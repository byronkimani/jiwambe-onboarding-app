import { http, HttpResponse } from "msw";
import {
  DEMO_OTP_CODE,
} from "@/lib/global/auth/demo-credentials";
import { normalizeEmail } from "@/lib/global/auth/normalize-email";
import { OFFICER_AUTH_UPSTREAM } from "@/lib/global/auth/officer-auth-paths";
import { upstreamPath } from "@/mocks/handlers/upstream-path";
import {
  getOfficerAuthMockState,
  resetOfficerAuthMockState,
} from "@/mocks/officer-auth-mock-state";
import { officerProfileFromBearerToken } from "@/lib/onboarding/fixtures/officer-profile-fixtures";

export { resetOfficerAuthMockState };

function newSessionId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function parseJson<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null;
  return body as T;
}

function authPath(segment: keyof typeof OFFICER_AUTH_UPSTREAM): string {
  return upstreamPath(OFFICER_AUTH_UPSTREAM[segment]);
}

export const onboardingOfficerAuthHandlers = [
  http.get(upstreamPath("/onboarding/agents/profile"), ({ request }) => {
    const profile = officerProfileFromBearerToken(
      request.headers.get("Authorization"),
    );
    if (!profile) {
      return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(profile);
  }),

  http.post(authPath("login"), async ({ request }) => {
    const {
      officers,
      otpSessions,
    } = getOfficerAuthMockState();
    const body = parseJson<{ email?: string; password?: string }>(
      await request.json(),
    );
    const email = body?.email ? normalizeEmail(body.email) : "";
    const password = body?.password ?? "";

    if (email === "rate.limit@contractor.jiwambe.com") {
      return HttpResponse.json(
        {
          error: "rate_limited",
          message: "Too many attempts. Try again in a few minutes.",
          retry_after_seconds: 120,
        },
        { status: 429 },
      );
    }

    const officer = officers.get(email);

    if (!officer) {
      return HttpResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    if (officer.blocked) {
      return HttpResponse.json({ error: "account_blocked" }, { status: 403 });
    }
    if (officer.password !== password) {
      return HttpResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const otpSessionId = newSessionId("ots");
    otpSessions.set(otpSessionId, {
      email,
      code: DEMO_OTP_CODE,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      resendAvailableAt: Date.now() + 60_000,
    });

    return HttpResponse.json({
      otp_session_id: otpSessionId,
      masked_phone: officer.maskedPhone,
      resend_available_in_seconds: 60,
    });
  }),

  http.post(authPath("otpResend"), async ({ request }) => {
    const { otpSessions } = getOfficerAuthMockState();
    const body = parseJson<{ otp_session_id?: string }>(await request.json());
    const sessionId = body?.otp_session_id ?? "";
    const session = otpSessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      return HttpResponse.json(
        { error: "otp_expired", message: "Session expired. Sign in again." },
        { status: 410 },
      );
    }

    if (Date.now() < session.resendAvailableAt) {
      const waitSec = Math.ceil((session.resendAvailableAt - Date.now()) / 1000);
      return HttpResponse.json(
        {
          error: "rate_limited",
          message: `Wait ${waitSec}s before requesting another code.`,
        },
        { status: 429 },
      );
    }

    session.resendAvailableAt = Date.now() + 60_000;
    return HttpResponse.json({
      resend_available_in_seconds: 60,
      message: "We sent a new code by SMS.",
    });
  }),

  http.post(authPath("logout"), async ({ request }) => {
    const { refreshTokens } = getOfficerAuthMockState();
    const body = parseJson<{ refresh_token?: string }>(await request.json());
    const refresh = body?.refresh_token ?? "";
    refreshTokens.delete(refresh);
    return HttpResponse.json({ ok: true });
  }),

  http.post(authPath("otpVerify"), async ({ request }) => {
    const { officers, otpSessions, refreshTokens } = getOfficerAuthMockState();
    const body = parseJson<{
      otp_session_id?: string;
      code?: string;
    }>(await request.json());
    const sessionId = body?.otp_session_id ?? "";
    const code = body?.code ?? "";
    const session = otpSessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      return HttpResponse.json(
        { error: "otp_expired", message: "Code expired. Sign in again." },
        { status: 401 },
      );
    }

    if (session.code !== code) {
      session.attempts += 1;
      const remaining = Math.max(0, 5 - session.attempts);
      if (remaining === 0) {
        return HttpResponse.json(
          {
            error: "rate_limited",
            message: "Too many incorrect codes. Try again later.",
            retries_remaining: 0,
          },
          { status: 429 },
        );
      }
      return HttpResponse.json(
        {
          error: "invalid_otp",
          message: "Incorrect code. Try again.",
          retries_remaining: remaining,
        },
        { status: 401 },
      );
    }

    otpSessions.delete(sessionId);
    const officer = officers.get(session.email);
    if (!officer) {
      return HttpResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const refresh = `mock_refresh_${officer.email}`;
    refreshTokens.set(refresh, officer.email);

    return HttpResponse.json({
      access_token: `mock_access_${officer.email}`,
      refresh_token: refresh,
      expires_in: 3600,
      officer: {
        email: officer.email,
        name: officer.name,
      },
    });
  }),

  http.post(authPath("refresh"), async ({ request }) => {
    const { officers, refreshTokens } = getOfficerAuthMockState();
    const body = parseJson<{ refresh_token?: string }>(await request.json());
    const refresh = body?.refresh_token ?? "";
    const email = refreshTokens.get(refresh);
    if (!email) {
      return HttpResponse.json({ error: "invalid_refresh" }, { status: 401 });
    }
    const officer = officers.get(email);
    if (!officer) {
      return HttpResponse.json({ error: "invalid_refresh" }, { status: 401 });
    }
    return HttpResponse.json({
      access_token: `mock_access_${officer.email}`,
      refresh_token: refresh,
      expires_in: 3600,
    });
  }),

  http.post(authPath("activate"), async ({ request }) => {
    const { activationSessions, pendingActivationTokens } =
      getOfficerAuthMockState();
    const body = parseJson<{ token?: string }>(await request.json());
    const token = body?.token ?? "";
    const email = pendingActivationTokens.get(token);

    if (!email) {
      return HttpResponse.json({ error: "activation_expired" }, { status: 410 });
    }

    const activationSessionId = newSessionId("act");
    activationSessions.set(activationSessionId, {
      email,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    const masked = email.replace(/(^.).*(@.*$)/, "$1••••$2");

    return HttpResponse.json({
      activation_session_id: activationSessionId,
      email_masked: masked,
    });
  }),

  http.post(authPath("activatePassword"), async ({ request }) => {
    const {
      officers,
      activationSessions,
      pendingActivationTokens,
    } = getOfficerAuthMockState();
    const body = parseJson<{
      activation_session_id?: string;
      password?: string;
    }>(await request.json());
    const sessionId = body?.activation_session_id ?? "";
    const password = body?.password ?? "";
    const session = activationSessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      return HttpResponse.json({ error: "activation_expired" }, { status: 410 });
    }
    if (password.length < 8) {
      return HttpResponse.json({ error: "weak_password" }, { status: 400 });
    }

    activationSessions.delete(sessionId);
    pendingActivationTokens.forEach((value, key) => {
      if (value === session.email) {
        pendingActivationTokens.delete(key);
      }
    });

    officers.set(session.email, {
      email: session.email,
      password,
      name: "New Onboarding Agent",
      maskedPhone: "07•• ••• 456",
      blocked: false,
    });

    return HttpResponse.json({ ok: true });
  }),

  http.post(authPath("passwordForgot"), async ({ request }) => {
    const body = parseJson<{ email?: string }>(await request.json());
    const email = body?.email ? normalizeEmail(body.email) : "";

    if (email === "rate.limit@contractor.jiwambe.com") {
      return HttpResponse.json(
        {
          error: "rate_limited",
          message: "Too many reset requests. Try again later.",
        },
        { status: 429 },
      );
    }

    return HttpResponse.json({
      message:
        "If an account exists for that email, we sent reset instructions.",
    });
  }),

  http.post(authPath("passwordReset"), async ({ request }) => {
    const { resetSessions, pendingResetTokens } = getOfficerAuthMockState();
    const body = parseJson<{ token?: string }>(await request.json());
    const token = body?.token ?? "";
    const email = pendingResetTokens.get(token);

    if (!email) {
      return HttpResponse.json({ error: "reset_expired" }, { status: 410 });
    }

    const resetSessionId = newSessionId("rst");
    resetSessions.set(resetSessionId, {
      email,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    const masked = email.replace(/(^.).*(@.*$)/, "$1••••$2");

    return HttpResponse.json({
      reset_session_id: resetSessionId,
      email_masked: masked,
    });
  }),

  http.post(authPath("passwordResetPassword"), async ({ request }) => {
    const {
      officers,
      resetSessions,
      pendingResetTokens,
    } = getOfficerAuthMockState();
    const body = parseJson<{
      reset_session_id?: string;
      password?: string;
    }>(await request.json());
    const sessionId = body?.reset_session_id ?? "";
    const password = body?.password ?? "";
    const session = resetSessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      return HttpResponse.json({ error: "reset_expired" }, { status: 410 });
    }
    if (password.length < 8) {
      return HttpResponse.json({ error: "weak_password" }, { status: 400 });
    }

    resetSessions.delete(sessionId);
    pendingResetTokens.forEach((value, key) => {
      if (value === session.email) {
        pendingResetTokens.delete(key);
      }
    });

    const existing = officers.get(session.email);
    if (existing) {
      officers.set(session.email, { ...existing, password });
    }

    return HttpResponse.json({ ok: true });
  }),
];
