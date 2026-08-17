"use client";

type CeremonyFooterActionsProps = {
  onPause?: () => void;
  onDisqualify?: () => void;
  backHref?: string;
  backLabel?: string;
};

export function CeremonyFooterActions({
  onPause,
  onDisqualify,
  backHref,
  backLabel = "← Worklist",
}: CeremonyFooterActionsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2.5">
      {backHref ? (
        <a
          href={backHref}
          className="jw-tap rounded-[11px] border-[1.5px] border-line-strong px-5 py-3.5 text-[15px] font-bold text-ink"
        >
          {backLabel}
        </a>
      ) : null}
      <div className="flex-1" />
      {onPause ? (
        <button
          type="button"
          className="jw-tap rounded-[11px] border-[1.5px] border-line-strong px-4 py-2.5 text-[13.5px] font-bold text-ink-soft"
          onClick={onPause}
        >
          ⏸ Pause
        </button>
      ) : null}
      {onDisqualify ? (
        <button
          type="button"
          className="jw-tap px-2 py-2.5 text-[13.5px] font-bold text-red"
          onClick={onDisqualify}
        >
          Disqualify
        </button>
      ) : null}
    </div>
  );
}
