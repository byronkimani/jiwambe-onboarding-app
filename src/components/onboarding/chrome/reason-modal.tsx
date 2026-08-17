"use client";

import { useId, useState } from "react";
import { ProtoBtn, ProtoTextarea } from "@/components/onboarding/atoms/proto-field";

type ReasonModalProps = {
  open: boolean;
  title: string;
  hint: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export function ReasonModal({
  open,
  title,
  hint,
  confirmLabel,
  tone = "default",
  onConfirm,
  onCancel,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const titleId = useId();
  const ok = reason.trim().length >= 6;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-6"
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="animate-fade-up w-full max-w-[440px] rounded-[18px] bg-card p-[22px]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-xl text-ink">
          {title}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          {hint}
        </p>
        <ProtoTextarea
          className="mt-4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required, min 6 chars)…"
          autoFocus
        />
        <div className="mt-4 flex gap-2.5">
          <ProtoBtn ghost className="flex-1" onClick={onCancel}>
            Cancel
          </ProtoBtn>
          <ProtoBtn
            className="flex-1"
            danger={tone === "danger"}
            disabled={!ok}
            onClick={() => {
              onConfirm(reason.trim());
              setReason("");
            }}
          >
            {confirmLabel}
          </ProtoBtn>
        </div>
      </div>
    </div>
  );
}
