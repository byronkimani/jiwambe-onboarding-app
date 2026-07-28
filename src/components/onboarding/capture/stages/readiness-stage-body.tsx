"use client";

import Link from "next/link";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  MIN_DEPOSIT_BY_OPERATING_MODEL,
  MIN_DEPOSIT_KES,
} from "@/lib/onboarding/fixtures/capture-fixtures";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { cn } from "@/lib/utils";

type Props = {
  form: CaptureFormState;
  patchForm: (patch: Partial<CaptureFormState>) => void;
};

export function ReadinessStageBody({ form, patchForm }: Props) {
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
      {READINESS_ITEMS.map((item) => {
        const checked = Boolean(r[item.k]);
        return (
          <label
            key={item.k}
            className={cn(
              "jw-tap flex cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 text-left",
              checked
                ? "border-accent bg-accent-soft"
                : "border-line bg-card-deep",
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 size-[17px] shrink-0 accent-accent"
              checked={checked}
              onChange={() => toggle(item.k)}
            />
            <span className="text-[13.5px] font-medium leading-snug text-ink">
              {item.label}
            </span>
          </label>
        );
      })}

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
          {MIN_DEPOSIT_BY_OPERATING_MODEL.map(({ label, key }) => (
            <div
              key={key}
              className="rounded-[10px] bg-white/10 px-3 py-2.5"
            >
              <p className="text-[11px] font-semibold text-white/60">{label}</p>
              <p className="mt-0.5 font-mono text-[15px] font-bold text-white">
                {formatKes(MIN_DEPOSIT_KES[key])}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] leading-snug text-white/55">
          Read the figure from here, not from memory. The exact minimum is
          enforced once the operating model is set.
        </p>
      </div>

      {anyChecked && !allYes ? (
        <p className="animate-fade-up rounded-xl bg-amber-bg px-3.5 py-3 text-[13px] font-semibold leading-snug text-amber">
          Something&apos;s missing — better to pause here than have an
          application stall halfway with the customer waiting.
        </p>
      ) : null}

      <Link
        href={AppRoutes.desk}
        className="mt-2 text-[13.5px] font-bold text-ink-soft underline"
      >
        Customer isn&apos;t ready — return to desk
      </Link>
    </div>
  );
}
