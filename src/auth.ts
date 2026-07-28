import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import {
  DEMO_AGENT_PASSWORD,
  DEMO_AGENT_PHONE_NATIONAL,
  DEMO_OTP_CODE,
  isValidOfficerEmail,
  isValidOfficerPassword,
} from "@/lib/global/auth/demo-credentials";
import {
  fetchAgentMeUpstream,
  loginAgentUpstream,
} from "@/lib/global/auth/upstream-auth";
import { buildDemoOfficerAuthUser } from "@/lib/global/auth/authorize-demo-officer";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";
import type { JWT } from "next-auth/jwt";

const DEMO_SESSION_MS = 24 * 60 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "officer-email-otp",
      name: "Officer email, password, and OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        const otp = credentials?.otp;
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          typeof otp !== "string"
        ) {
          return null;
        }

        if (
          !isValidOfficerEmail(email) ||
          !isValidOfficerPassword(password) ||
          otp !== DEMO_OTP_CODE
        ) {
          return null;
        }

        if (isMockJiwambeApiEnabled()) {
          return buildDemoOfficerAuthUser(email);
        }

        const login = await loginAgentUpstream(
          DEMO_AGENT_PHONE_NATIONAL,
          DEMO_AGENT_PASSWORD,
        );
        if (!login.ok) {
          return null;
        }

        const me = await fetchAgentMeUpstream(login.accessToken);
        if (!me.ok) {
          return null;
        }

        return {
          id: me.data.id,
          name: me.data.name,
          email: email.trim().toLowerCase(),
          agentId: me.data.id,
          agentRole: me.data.role,
          dealership: me.data.dealership,
          backendAccessToken: login.accessToken,
          backendRefreshToken: login.refreshToken,
          accessTokenExpires: Date.now() + login.expiresIn * 1000,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const u = user as {
          email?: string | null;
          agentId?: string;
          agentRole?: string;
          dealership?: string;
          backendAccessToken?: string;
          backendRefreshToken?: string;
          accessTokenExpires?: number;
        };
        return {
          ...token,
          sub: user.id,
          name: user.name,
          email: u.email ?? undefined,
          agentId: u.agentId ?? user.id,
          agentRole: u.agentRole,
          dealership: u.dealership,
          backendAccessToken: u.backendAccessToken,
          backendRefreshToken: u.backendRefreshToken,
          accessTokenExpires:
            u.accessTokenExpires ?? Date.now() + DEMO_SESSION_MS,
          error: undefined,
        };
      }

      const expiresAt =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : 0;
      if (Date.now() < expiresAt) {
        return token;
      }

      return { ...token, error: "RefreshError" };
    },
    async session({ session, token }) {
      if (token.error === "RefreshError") {
        session.error = token.error;
        return session;
      }
      if (typeof token.agentId === "string") {
        session.agentId = token.agentId;
        session.user.id = token.agentId;
      } else if (typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      if (typeof token.agentRole === "string") {
        session.agentRole = token.agentRole;
      }
      if (typeof token.dealership === "string") {
        session.dealership = token.dealership;
      }
      if (typeof token.backendAccessToken === "string") {
        session.backendAccessToken = token.backendAccessToken;
      }
      if (typeof token.name === "string") {
        session.user.name = token.name;
      }
      if (typeof token.email === "string") {
        session.user.email = token.email;
      }
      return session;
    },
  },
});
