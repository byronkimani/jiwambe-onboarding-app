"use client";

import { useEffect, useState } from "react";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { apiOnboardingApplication } from "@/lib/global/shared/routes";

export function useApplication(id: string) {
  const [application, setApplication] = useState<OnboardingApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const response = await fetch(apiOnboardingApplication(id));
      if (!response.ok) {
        if (!cancelled) {
          setError("not_found");
          setLoading(false);
        }
        return;
      }
      const body = (await response.json()) as {
        application: OnboardingApplication;
      };
      if (!cancelled) {
        setApplication(body.application);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { application, loading, error };
}
