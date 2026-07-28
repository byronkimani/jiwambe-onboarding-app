"use client";

import { useId, useState } from "react";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

type ReasonModalProps = {
  open: boolean;
  title: string;
  hint: string;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export function ReasonModal({
  open,
  title,
  hint,
  confirmLabel,
  onConfirm,
  onCancel,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="animate-fade-up relative z-10 w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-xl"
      >
        <h2 id={titleId} className="font-display text-xl text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{hint}</p>
        <textarea
          className="mt-4 min-h-[100px] w-full rounded-xl border-[1.5px] border-line bg-card-deep p-3 text-sm text-ink"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required)"
        />
        <div className="mt-4 flex gap-2">
          <ProtoBtn ghost className="flex-1" onClick={onCancel}>
            Cancel
          </ProtoBtn>
          <ProtoBtn
            className="flex-1"
            disabled={reason.trim().length < 6}
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
