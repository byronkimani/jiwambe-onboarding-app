"use client";

import { bffFetch } from "@/lib/global/client/bff-fetch";
import { useEffect, useState } from "react";
import {
  InventoryItem,
  InventoryRules,
} from "@/lib/onboarding/schemas/inventory-schemas";
import { DEFAULT_INVENTORY_RULES } from "@/lib/onboarding/inventory/inventory-catalog";
import { FieldRoutes } from "@/lib/global/shared/routes";

export function useInventory(dealershipId?: string | null) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [rules, setRules] = useState<InventoryRules>(DEFAULT_INVENTORY_RULES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const params = dealershipId
        ? `?dealershipId=${encodeURIComponent(dealershipId)}`
        : "";
      const response = await bffFetch(
        `${FieldRoutes.bikesAssignable}${params}`,
        { credentials: "same-origin" },
      );
      if (!response.ok) {
        if (!cancelled) {
          setError("Could not load inventory.");
          setLoading(false);
        }
        return;
      }
      const body = (await response.json()) as {
        items?: InventoryItem[];
        rules?: InventoryRules;
      };
      if (!cancelled) {
        setItems(body.items ?? []);
        setRules(body.rules ?? DEFAULT_INVENTORY_RULES);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [dealershipId]);

  return { items, rules, loading, error };
}
