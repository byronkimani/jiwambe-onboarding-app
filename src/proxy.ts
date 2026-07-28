import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  AppRoutes,
  isCapturePath,
  isDeskPath,
  isPublicApiOnboardingPath,
} from "@/lib/global/shared/routes";
import { sanitizeCallbackUrl } from "@/lib/global/shared/sanitize-callback-url";

function isProtectedAppPath(pathname: string): boolean {
  return isDeskPath(pathname) || isCapturePath(pathname);
}

export default auth((request) => {
  const { pathname, searchParams } = request.nextUrl;
  const isLoggedIn = Boolean(request.auth?.user);
  const sessionError = request.auth?.error;

  if (isLoggedIn && sessionError === "RefreshError") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AppRoutes.home;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("sessionExpired", "1");
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && pathname === AppRoutes.home) {
    const callbackUrl = sanitizeCallbackUrl(
      searchParams.get("callbackUrl"),
      AppRoutes.desk,
    );
    return NextResponse.redirect(new URL(callbackUrl, request.nextUrl));
  }

  if (!isLoggedIn && pathname.startsWith("/api/onboarding")) {
    if (isPublicApiOnboardingPath(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLoggedIn && isProtectedAppPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AppRoutes.home;
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "callbackUrl",
      sanitizeCallbackUrl(pathname, AppRoutes.desk),
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|.*\\.(?:png|webmanifest|svg|ico|js)$).*)",
  ],
};
