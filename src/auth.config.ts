import type { NextAuthConfig } from "next-auth";
import {
  AppRoutes,
  isProtectedApiPath,
  isProtectedPath,
  isPublicApiOnboardingPath,
  isPublicPath,
} from "@/lib/global/shared/routes";

/**
 * Edge-safe Auth.js config — providers and jwt callbacks added in Phase 3.
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: AppRoutes.home,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const sessionAuth = auth as { user?: unknown; error?: string } | null;
      const isLoggedIn =
        Boolean(sessionAuth?.user) && sessionAuth?.error !== "RefreshError";

      if (isPublicPath(pathname) || isPublicApiOnboardingPath(pathname)) {
        return true;
      }

      if (isProtectedPath(pathname) || isProtectedApiPath(pathname)) {
        return isLoggedIn;
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
