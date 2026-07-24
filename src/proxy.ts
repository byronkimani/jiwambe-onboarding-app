import { NextResponse } from "next/server";

/**
 * Route gate stub — Phase 1: all routes public.
 * Phase 2: wrap with Auth.js `auth()` from `@/auth`.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|webmanifest|svg|ico|js)$).*)",
  ],
};
