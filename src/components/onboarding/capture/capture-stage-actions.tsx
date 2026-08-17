"use client";

type CaptureStageActionsProps = {
  onPause?: () => void;
  pauseDisabled?: boolean;
  onDisqualify?: () => void;
};

export function CaptureStageActions({
  onPause,
  pauseDisabled,
  onDisqualify,
}: CaptureStageActionsProps) {
  if (!onPause && !onDisqualify) return null;

  return (
    <div className="mx-auto mb-2 flex max-w-[760px] justify-end gap-2">
      {onPause ? (
        <button
          type="button"
          className="jw-tap rounded-[10px] border-[1.5px] border-line-strong px-3.5 py-2 text-[12.5px] font-bold text-ink-soft disabled:opacity-50"
          disabled={pauseDisabled}
          onClick={onPause}
        >
          ⏸ Pause application
        </button>
      ) : null}
      {onDisqualify ? (
        <button
          type="button"
          className="jw-tap px-1.5 py-2 text-[12.5px] font-bold text-red"
          onClick={onDisqualify}
        >
          Disqualify
        </button>
      ) : null}
    </div>
  );
}
