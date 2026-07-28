import type { ApplicationState, StateMeta } from "@/lib/onboarding/types";

/** Prototype `data.js` LIFECYCLE — used for officer lifeline strip (`desk.js`). */
export const FULL_LIFECYCLE = [
  "DRAFT",
  "CAPTURED",
  "OPS_REVIEW",
  "LMS_CREATED",
  "AGREEMENT_SIGNED",
  "READY_FOR_RELEASE",
  "RELEASED",
  "ACTIVE_LOAN",
] as const;

export type LifecycleStep = (typeof FULL_LIFECYCLE)[number];

/** Officer worklist lifeline (skips DRAFT). */
export const OFFICER_LIFELINE_STEPS = FULL_LIFECYCLE.slice(1);

const STATE_LIFELINE_INDEX: Record<ApplicationState, number> = {
  PAUSED: 1,
  DISQUALIFIED: 7,
  OPS_REVIEW: 2,
  LMS_CREATED: 3,
  AGREEMENT_SIGNED: 4,
  READY_FOR_RELEASE: 5,
  ACTIVE_LOAN: 7,
};

export function lifelineIndexForState(state: ApplicationState): number {
  return STATE_LIFELINE_INDEX[state] ?? 1;
}

/** @deprecated Use lifelineIndexForState — kept for imports */
export const LIFECYCLE: ApplicationState[] = [
  "OPS_REVIEW",
  "LMS_CREATED",
  "AGREEMENT_SIGNED",
  "READY_FOR_RELEASE",
  "ACTIVE_LOAN",
];

export const STATE_META: Record<ApplicationState, StateMeta> = {
  PAUSED: {
    label: "Paused — bike released to stock",
    tone: "wait",
    action: "resume",
  },
  DISQUALIFIED: {
    label: "Disqualified",
    tone: "done",
    action: "summary",
  },
  OPS_REVIEW: {
    label: "Awaiting ops review",
    tone: "wait",
    action: null,
  },
  LMS_CREATED: {
    label: "Returned to you — generate agreement",
    tone: "act",
    action: "agreement",
  },
  AGREEMENT_SIGNED: {
    label: "Signed — preparing release",
    tone: "wait",
    action: null,
  },
  READY_FOR_RELEASE: {
    label: "Ready for bike release",
    tone: "act",
    action: "release",
  },
  ACTIVE_LOAN: {
    label: "Active loan — fully onboarded",
    tone: "done",
    action: "summary",
  },
};

export function getStateMeta(state: ApplicationState): StateMeta {
  return STATE_META[state];
}
