import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authorizeOfficerOtpCredentials } from "@/lib/global/auth/officer-otp-authorize";
import { OtpVerifyError } from "@/lib/global/auth/otp-verify-error";
import {
  accessTokenNeedsRefresh,
  refreshOfficerTokens,
} from "@/lib/global/auth/officer-auth-upstream";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      email?: string | null;
    };
    error?: string;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
  }
}

type OfficerJwt = JWT & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  error?: string;
  email?: string | null;
  sub?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "officer-otp",
      name: "Officer OTP",
      credentials: {
        email: { type: "text" },
        otpSessionId: { type: "text" },
        code: { type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const otpSessionId = String(credentials?.otpSessionId ?? "");
        const code = String(credentials?.code ?? "");

        try {
          return await authorizeOfficerOtpCredentials(email, otpSessionId, code);
        } catch (error) {
          if (error instanceof OtpVerifyError) {
            throw error;
          }
          throw new OtpVerifyError({
            code: "UPSTREAM_ERROR",
            message: "Something went wrong. Please try again.",
          });
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const jwt = token as OfficerJwt;

      if (user) {
        jwt.accessToken = user.accessToken;
        jwt.refreshToken = user.refreshToken;
        jwt.accessTokenExpiresAt = user.accessTokenExpiresAt;
        jwt.backendAccessToken = user.accessToken;
        jwt.backendRefreshToken = user.refreshToken;
        jwt.sub = user.id;
        jwt.email = user.email;
        delete jwt.error;
        return jwt as JWT;
      }

      if (jwt.error === "RefreshError") {
        return jwt as JWT;
      }

      if (
        jwt.refreshToken &&
        accessTokenNeedsRefresh(jwt.accessTokenExpiresAt)
      ) {
        const refreshed = await refreshOfficerTokens(jwt.refreshToken);
        if (!refreshed.ok) {
          jwt.error = "RefreshError";
          return jwt;
        }
        jwt.accessToken = refreshed.accessToken;
        jwt.refreshToken = refreshed.refreshToken;
        jwt.accessTokenExpiresAt = refreshed.accessTokenExpiresAt;
        jwt.backendAccessToken = refreshed.accessToken;
        jwt.backendRefreshToken = refreshed.refreshToken;
      }

      return jwt as JWT;
    },
    async session({ session, token }) {
      const jwt = token as OfficerJwt;
      if (session.user) {
        session.user.email = jwt.email ?? session.user.email;
      }
      if (jwt.error) {
        session.error = jwt.error;
      }
      return session;
    },
  },
});
