import type { ApplicationState } from "@/lib/onboarding/types";
import {
  lifelineIndexForState,
  STATE_META,
} from "@/lib/onboarding/fixtures/state-meta";

export function lifelineIndex(state: ApplicationState): number {
  return lifelineIndexForState(state);
}

export function primaryActionForState(
  state: ApplicationState,
): "agreement" | "release" | "summary" | "resume" | null {
  return STATE_META[state]?.action ?? null;
}

export function isHistoryState(state: ApplicationState): boolean {
  return state === "ACTIVE_LOAN" || state === "DISQUALIFIED";
}

export function isDraftState(state: ApplicationState): boolean {
  return state === "PAUSED" || state === "DRAFT";
}

export function isLiveDeskState(state: ApplicationState): boolean {
  return !isHistoryState(state) && !isDraftState(state);
}
