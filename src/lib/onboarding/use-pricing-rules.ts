"use client";

import { bffFetch } from "@/lib/global/client/bff-fetch";
import { useEffect, useState } from "react";
import { FieldRoutes } from "@/lib/global/shared/routes";

export type OperatingModelMinDeposit = {
  operatingModel: string;
  label: string;
  minDepositKes: number;
};

export function usePricingRules() {
  const [rules, setRules] = useState<OperatingModelMinDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await bffFetch(FieldRoutes.productsPricingRules, {
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (!cancelled) {
            setError("Could not load deposit minimums.");
            setRules([]);
          }
          return;
        }
        const body = (await response.json()) as {
          operatingModels?: OperatingModelMinDeposit[];
        };
        if (!cancelled) {
          setRules(body.operatingModels ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load deposit minimums.");
          setRules([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rules, loading, error };
}
