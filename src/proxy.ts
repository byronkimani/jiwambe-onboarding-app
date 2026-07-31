import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  ensureRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/global/observability/request-id";
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

function forwardWithRequestId(request: Request): NextResponse {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, ensureRequestId(requestHeaders));
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export default auth((request) => {
  const { pathname, searchParams } = request.nextUrl;
  const sessionError = request.auth?.error;
  const hasValidSession =
    Boolean(request.auth?.user) && sessionError !== "RefreshError";

  if (sessionError === "RefreshError") {
    if (pathname !== AppRoutes.home) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = AppRoutes.home;
      redirectUrl.search = "";
      redirectUrl.searchParams.set("sessionExpired", "1");
      return NextResponse.redirect(redirectUrl);
    }
    return forwardWithRequestId(request);
  }

  if (hasValidSession && pathname === AppRoutes.home) {
    const callbackUrl = sanitizeCallbackUrl(
      searchParams.get("callbackUrl"),
      AppRoutes.desk,
    );
    return NextResponse.redirect(new URL(callbackUrl, request.nextUrl));
  }

  if (
    !hasValidSession &&
    (pathname.startsWith("/api/onboarding") ||
      pathname.startsWith("/api/catalog") ||
      pathname.startsWith("/api/customers") ||
      pathname.startsWith("/api/inventory") ||
      pathname.startsWith("/api/payments"))
  ) {
    if (isPublicApiOnboardingPath(pathname)) {
      return forwardWithRequestId(request);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasValidSession && isProtectedAppPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AppRoutes.home;
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "callbackUrl",
      sanitizeCallbackUrl(pathname, AppRoutes.desk),
    );
    return NextResponse.redirect(redirectUrl);
  }

  return forwardWithRequestId(request);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|.*\\.(?:png|webmanifest|svg|ico|js)$).*)",
  ],
};
