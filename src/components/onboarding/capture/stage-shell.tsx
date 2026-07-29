"use client";

import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

type StageShellProps = {
  title: string;
  sub?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onPause?: () => void;
  pauseDisabled?: boolean;
  onDisqualify?: () => void;
};

export function StageShell({
  title,
  sub,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled,
  onPause,
  pauseDisabled,
  onDisqualify,
}: StageShellProps) {
  return (
    <div className="animate-fade-up mx-auto max-w-[760px]">
      <h1 className="font-display text-[27px] text-ink">{title}</h1>
      {sub ? (
        <p className="mb-6 mt-1 text-sm leading-relaxed text-ink-soft">
          {sub}
        </p>
      ) : null}
      {children}
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        {onBack ? (
          <ProtoBtn ghost onClick={onBack}>
            ← Back
          </ProtoBtn>
        ) : null}
        {onNext ? (
          <ProtoBtn
            className="max-w-[240px] flex-1"
            disabled={nextDisabled}
            onClick={onNext}
          >
            {nextLabel}
          </ProtoBtn>
        ) : null}
        {onPause || onDisqualify ? <div className="flex-1" /> : null}
        {onPause ? (
          <button
            type="button"
            className="jw-tap rounded-[11px] border-[1.5px] border-line-strong px-4 py-2.5 text-[13.5px] font-bold text-ink-soft disabled:opacity-50"
            disabled={pauseDisabled}
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
    </div>
  );
}
