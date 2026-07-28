import {
  CAPTURE_STAGE_KEYS,
  type CaptureStageKey,
  captureStage,
} from "@/lib/global/shared/routes";

export function nextCaptureStage(
  current: CaptureStageKey,
): CaptureStageKey | null {
  const idx = CAPTURE_STAGE_KEYS.indexOf(current);
  if (idx < 0 || idx >= CAPTURE_STAGE_KEYS.length - 1) return null;
  return CAPTURE_STAGE_KEYS[idx + 1];
}

export function prevCaptureStage(
  current: CaptureStageKey,
): CaptureStageKey | null {
  const idx = CAPTURE_STAGE_KEYS.indexOf(current);
  if (idx <= 0) return null;
  return CAPTURE_STAGE_KEYS[idx - 1];
}

export function captureStagePath(stage: CaptureStageKey): string {
  return captureStage(stage);
}
