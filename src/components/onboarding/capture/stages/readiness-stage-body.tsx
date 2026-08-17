"use client";

import Link from "next/link";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { cn } from "@/lib/utils";
import { ProtoCheckbox } from "@/components/onboarding/atoms/proto-checkbox";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import { usePricingRules } from "@/lib/onboarding/use-pricing-rules";

type Props = {
  form: CaptureFormState;
  patchForm: (patch: Partial<CaptureFormState>) => void;
  showValidation?: boolean;
};

export function ReadinessStageBody({
  form,
  patchForm,
  showValidation = false,
}: Props) {
  const { rules, loading: rulesLoading, error: rulesError } = usePricingRules();
  const r = form.readiness;
  const allYes = READINESS_ITEMS.every((it) => r[it.k]);
  const anyChecked = READINESS_ITEMS.some((it) => r[it.k]);

  function toggle(k: (typeof READINESS_ITEMS)[number]["k"]) {
    patchForm({
      readiness: { ...r, [k]: !r[k] },
    });
  }

  function selectAllOrClear() {
    patchForm({
      readiness: allYes
        ? {}
        : Object.fromEntries(READINESS_ITEMS.map((it) => [it.k, true])),
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      {READINESS_ITEMS.map((item) => (
        <ProtoCheckbox
          key={item.k}
          checked={Boolean(r[item.k])}
          onChange={() => toggle(item.k)}
          label={item.label}
        />
      ))}

      <button
        type="button"
        className={cn(
          "jw-tap flex w-full items-center gap-2.5 rounded-xl border-[1.5px] border-dashed px-3.5 py-3 text-left",
          allYes
            ? "border-ink bg-ink text-white"
            : "border-line-strong bg-card text-ink-soft",
        )}
        onClick={selectAllOrClear}
      >
        <span
          className={cn(
            "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border-2 text-[11px] font-extrabold",
            allYes
              ? "border-mint bg-mint text-ink"
              : "border-line-strong bg-transparent",
          )}
        >
          {allYes ? "✓" : ""}
        </span>
        <span className="text-[13.5px] font-bold">
          {allYes
            ? "All confirmed — tap to clear"
            : "Reviewed everything with the customer — select all"}
        </span>
      </button>

      <div className="mt-2 rounded-[14px] bg-rail p-4">
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-mint">
          Minimum deposit by operating model
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {rulesLoading ? (
            <p className="col-span-full text-[12px] text-white/70">
              Loading minimums…
            </p>
          ) : rulesError ? (
            <p className="col-span-full text-[12px] font-semibold text-amber-200">
              {rulesError}
            </p>
          ) : (
            rules.map(({ label, operatingModel, minDepositKes }) => (
              <div
                key={operatingModel}
                className="rounded-[10px] bg-white/10 px-3 py-2.5"
              >
                <p className="text-[11px] font-semibold text-white/60">
                  {label}
                </p>
                <p className="mt-0.5 font-mono text-[15px] font-bold text-white">
                  {formatKes(minDepositKes)}
                </p>
              </div>
            ))
          )}
        </div>
        <p className="mt-2.5 text-[11.5px] leading-snug text-white/55">
          Figures come from the server — read them here, not from memory. Deposit
          minimums on the product step use the live quote for your selection.
        </p>
      </div>

      {anyChecked && !allYes ? (
        <p className="animate-fade-up rounded-xl bg-amber-bg px-3.5 py-3 text-[13px] font-semibold leading-snug text-amber">
          Something&apos;s missing — better to pause here than have an
          application stall halfway with the customer waiting.
        </p>
      ) : null}

      <CaptureInlineError
        show={showValidation && !isReadinessComplete(r)}
        message="Complete every readiness item before continuing."
      />

      <Link
        href={AppRoutes.desk}
        className="mt-2 text-[13.5px] font-bold text-ink-soft underline"
      >
        Customer isn&apos;t ready — return to desk
      </Link>
    </div>
  );
}
