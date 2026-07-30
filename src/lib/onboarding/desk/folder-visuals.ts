import type { ApplicationState } from "@/lib/onboarding/types";

export const STAMP_BY_STATE: Record<
  ApplicationState,
  { label: string; colorClass: string }
> = {
  DRAFT: { label: "Draft", colorClass: "text-ink-soft border-line-strong" },
  OPS_REVIEW: { label: "Pending review", colorClass: "text-kraft-ink border-kraft-ink" },
  LMS_CREATED: { label: "Approved", colorClass: "text-accent border-accent" },
  AGREEMENT_SIGNED: { label: "Signed", colorClass: "text-accent border-accent" },
  READY_FOR_RELEASE: {
    label: "Ready to release",
    colorClass: "text-accent border-accent",
  },
  ACTIVE_LOAN: { label: "Released", colorClass: "text-slate border-slate" },
  PAUSED: { label: "Paused", colorClass: "text-amber border-amber" },
  DISQUALIFIED: { label: "Disqualified", colorClass: "text-red border-red" },
};

export const MODEL_PILL: Record<
  string,
  { label: string; bgClass: string; fgClass: string }
> = {
  FLEET: {
    label: "Fleet · Bolt",
    bgClass: "bg-blue-bg",
    fgClass: "text-blue",
  },
  STAGE: {
    label: "Stage",
    bgClass: "bg-slate-bg",
    fgClass: "text-ink-soft",
  },
  DELIVERY: {
    label: "Delivery",
    bgClass: "bg-amber-bg",
    fgClass: "text-amber",
  },
  PERSONAL: {
    label: "Personal Use",
    bgClass: "bg-offline-bg",
    fgClass: "text-offline",
  },
};
