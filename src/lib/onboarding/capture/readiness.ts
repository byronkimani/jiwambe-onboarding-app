import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";

export function isReadinessComplete(
  readiness: Partial<Record<string, boolean>>,
): boolean {
  return READINESS_ITEMS.every((item) => Boolean(readiness[item.k]));
}
