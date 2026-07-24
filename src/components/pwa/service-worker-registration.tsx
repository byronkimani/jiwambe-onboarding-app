"use client";

import { useEffect } from "react";
import { registerAppServiceWorker } from "@/lib/global/pwa/register-service-worker";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    void registerAppServiceWorker();
  }, []);

  return null;
}
