"use client";

import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { cn } from "@/lib/utils";

type ExitCardProps = {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  steps?: string[];
  tone?: "default" | "danger";
  loading?: boolean;
};

export function ExitCard({
  title,
  body,
  actionLabel,
  onAction,
  steps,
  tone = "default",
  loading = false,
}: ExitCardProps) {
  const isDanger = tone === "danger";

  return (
    <div
      className={cn(
        "animate-fade-up mt-4 rounded-[14px] p-[18px]",
        isDanger ? "bg-red-bg" : "bg-amber-bg",
      )}
    >
      <p
        className={cn(
          "text-[14.5px] font-extrabold",
          isDanger ? "text-red" : "text-amber",
        )}
      >
        {title}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{body}</p>
      {steps && steps.length > 0 ? (
        <ol className="mt-3 list-decimal space-y-0 pl-[18px] text-[12.5px] leading-relaxed text-ink-soft">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      <ProtoBtn
        className="mt-3.5 w-full"
        ghost={!isDanger}
        onClick={onAction}
        disabled={loading}
      >
        {loading ? "Saving…" : actionLabel}
      </ProtoBtn>
    </div>
  );
}
