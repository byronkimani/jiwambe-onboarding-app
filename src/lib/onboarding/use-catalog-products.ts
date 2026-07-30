"use client";

import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/onboarding/schemas/catalog-schemas";
import { AppRoutes } from "@/lib/global/shared/routes";

export function useCatalogProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const response = await fetch(AppRoutes.apiCatalogProducts, {
        credentials: "same-origin",
      });
      if (!response.ok) {
        if (!cancelled) {
          setError("Could not load products.");
          setLoading(false);
        }
        return;
      }
      const body = (await response.json()) as { products?: CatalogProduct[] };
      if (!cancelled) {
        setProducts(body.products ?? []);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}
