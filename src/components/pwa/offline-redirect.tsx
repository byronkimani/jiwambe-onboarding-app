"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/global/shared/routes";

export function OfflineRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleOffline() {
      if (pathname !== AppRoutes.offline) {
        router.replace(AppRoutes.offline);
      }
    }

    function handleOnline() {
      if (pathname === AppRoutes.offline) {
        router.replace(AppRoutes.home);
      }
    }

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [pathname, router]);

  return null;
}
