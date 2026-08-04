"use client";

import { bffFetch } from "@/lib/global/client/bff-fetch";
import { useEffect, useState } from "react";
import { FieldRoutes } from "@/lib/global/shared/routes";

export type CatalogQuote = {
  dailyAmountKes: number;
  minDepositKes: number;
  depositKes: number;
  termMonths: number;
  operatingModel: string;
  financedAmountKes?: number;
};

export type CatalogQuoteInput = {
  productId: string;
  depositKes: number;
  termMonths: number;
  operatingModel: string;
  assetCondition?: "new" | "used";
  enabled?: boolean;
};

function canFetchCatalogQuote({
  enabled = true,
  productId,
  operatingModel,
  depositKes,
  termMonths,
}: CatalogQuoteInput): boolean {
  return (
    enabled &&
    Boolean(productId) &&
    Boolean(operatingModel) &&
    depositKes > 0 &&
    (termMonths === 18 || termMonths === 24)
  );
}

export function useCatalogQuote(input: CatalogQuoteInput) {
  const {
    productId,
    depositKes,
    termMonths,
    operatingModel,
    assetCondition = "new",
  } = input;
  const canFetch = canFetchCatalogQuote(input);

  const [quote, setQuote] = useState<CatalogQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setQuote(null);
      try {
        const response = await bffFetch(FieldRoutes.productsQuote, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            depositKes,
            termMonths,
            operatingModel,
            assetCondition,
          }),
        });
        if (!response.ok) {
          if (!cancelled) {
            setQuote(null);
            setError(
              response.status === 404
                ? "No quote for this product and deposit."
                : "Could not load quote.",
            );
          }
          return;
        }
        const body = (await response.json()) as {
          dailyAmountKes?: number;
          dailyInstallmentKes?: number;
          minDepositKes?: number;
          depositKes?: number;
          termMonths?: number;
          operatingModel?: string;
          financedAmountKes?: number;
        };
        if (!cancelled) {
          const daily =
            body.dailyAmountKes ?? body.dailyInstallmentKes ?? null;
          const min = body.minDepositKes ?? null;
          if (daily == null || min == null) {
            setQuote(null);
            setError("Invalid quote from server.");
            return;
          }
          setQuote({
            dailyAmountKes: daily,
            minDepositKes: min,
            depositKes: body.depositKes ?? depositKes,
            termMonths: body.termMonths ?? termMonths,
            operatingModel: body.operatingModel ?? operatingModel,
            financedAmountKes: body.financedAmountKes,
          });
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
          setError("Could not load quote.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    canFetch,
    productId,
    depositKes,
    termMonths,
    operatingModel,
    assetCondition,
  ]);

  if (!canFetch) {
    return { quote: null, loading: false, error: null };
  }

  return { quote, loading, error };
}
