"use client";

import { useEffect, useState } from "react";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import { mapResourceToDeskCard } from "@/lib/onboarding/map-resource-to-desk-card";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { parseApplicationResource } from "@/lib/onboarding/schemas/parse-onboarding-json";
import { apiOnboardingApplication } from "@/lib/global/shared/routes";

export function useApplication(id: string) {
  const [application, setApplication] = useState<OnboardingApplication | null>(
    null,
  );
  const [resource, setResource] =
    useState<OnboardingApplicationResource | null>(null);
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
        application?: OnboardingApplicationResource;
      };
      const parsed = parseApplicationResource(
        body.application ? { application: body.application } : body,
      );
      if (!cancelled) {
        if (!parsed.ok) {
          setError("invalid_response");
          setLoading(false);
          return;
        }
        setResource(parsed.data);
        setApplication(mapResourceToDeskCard(parsed.data));
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { application, resource, loading, error };
}
