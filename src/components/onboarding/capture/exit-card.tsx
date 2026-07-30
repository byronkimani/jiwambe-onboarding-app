"use client";

import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

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
  return (
    <div
      className={
        tone === "danger"
          ? "mt-4 rounded-2xl border border-red-200 bg-red-50 p-4"
          : "mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"
      }
    >
      <p
        className={
          tone === "danger"
            ? "text-sm font-bold text-red-800"
            : "text-sm font-bold text-amber-900"
        }
      >
        {title}
      </p>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
      {steps && steps.length > 0 ? (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      <ProtoBtn
        className="mt-4 w-full"
        ghost={tone !== "danger"}
        onClick={onAction}
        disabled={loading}
      >
        {loading ? "Saving…" : actionLabel}
      </ProtoBtn>
    </div>
  );
}
