import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isOnboardingSession } from "@/lib/global/auth/onboarding-session";

export { isOnboardingSession } from "@/lib/global/auth/onboarding-session";

type OfficerJwt = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  error?: string;
};

export async function getOfficerJwt(): Promise<OfficerJwt | null> {
  const hdrs = await headers();
  const token = await getToken({
    req: { headers: hdrs } as unknown as Request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token as OfficerJwt | null;
}

export async function requireOnboardingAccessToken(): Promise<
  { ok: true; accessToken: string } | { ok: false }
> {
  const session = await auth();
  if (!session?.user || session.error === "RefreshError") {
    return { ok: false };
  }
  const jwt = await getOfficerJwt();
  if (!jwt?.accessToken || jwt.error === "RefreshError") {
    return { ok: false };
  }
  return { ok: true, accessToken: jwt.accessToken };
}

export async function requireOnboardingRefreshToken(): Promise<
  { ok: true; refreshToken: string } | { ok: false }
> {
  const session = await auth();
  if (!session?.user || session.error === "RefreshError") {
    return { ok: false };
  }
  const jwt = await getOfficerJwt();
  if (!jwt?.refreshToken || jwt.error === "RefreshError") {
    return { ok: false };
  }
  return { ok: true, refreshToken: jwt.refreshToken };
}

export async function getOnboardingSession(): Promise<Session | null> {
  const session = await auth();
  return isOnboardingSession(session) ? session : null;
}
