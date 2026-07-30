"use client";

import { useId } from "react";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

type UnsavedChangesModalProps = {
  open: boolean;
  saving?: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export function UnsavedChangesModal({
  open,
  saving = false,
  onSaveDraft,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
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
          Unsaved changes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          You have unsaved work on this application. Save a draft before leaving,
          or discard your local changes.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <ProtoBtn disabled={saving} onClick={onSaveDraft}>
            {saving ? "Saving…" : "Save draft & leave"}
          </ProtoBtn>
          <ProtoBtn ghost disabled={saving} onClick={onDiscard}>
            Discard changes
          </ProtoBtn>
          <ProtoBtn ghost disabled={saving} onClick={onCancel}>
            Stay on page
          </ProtoBtn>
        </div>
      </div>
    </div>
  );
}
