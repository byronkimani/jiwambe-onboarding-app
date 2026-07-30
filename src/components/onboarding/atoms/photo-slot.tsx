"use client";

import { useRef, useState } from "react";
import { ProtoTag } from "@/components/onboarding/atoms/proto-tag";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";

type PhotoSlotProps = {
  label: string;
  required?: boolean;
  image?: string | null;
  onCapture: (file: File) => void;
  onRetake: () => void;
  onRetry?: () => void;
  captureDisabled?: boolean;
  showValidation?: boolean;
  validationMessage?: string | null;
  uploading?: boolean;
  uploadError?: string | null;
};

export function PhotoSlot({
  label,
  required,
  image,
  onCapture,
  onRetake,
  onRetry,
  captureDisabled = false,
  showValidation = false,
  validationMessage,
  uploading = false,
  uploadError = null,
}: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onCapture(file);
    event.target.value = "";
  }

  return (
    <div
      className={
        image
          ? "rounded-[14px] border-[1.5px] border-accent bg-accent-soft p-3.5"
          : "rounded-[14px] border-[1.5px] border-line bg-card-deep p-3.5"
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink">{label}</span>
        <ProtoTag tone={required ? "req" : "info"}>
          {uploading ? "Uploading…" : required ? "Required" : "Optional"}
        </ProtoTag>
      </div>
      {image ? (
        <div>
          <button type="button" className="block w-full" onClick={() => setZoom(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={label}
              className="h-[120px] w-full cursor-zoom-in rounded-[10px] border border-line bg-white object-cover"
            />
          </button>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
            {uploadError && onRetry ? (
              <button
                type="button"
                className="text-xs font-bold text-accent-deep underline"
                disabled={uploading}
                onClick={() => onRetry()}
              >
                Retry upload
              </button>
            ) : null}
            <button
              type="button"
              className="text-xs font-bold text-ink-soft underline"
              disabled={uploading}
              onClick={() => {
                onRetake();
              }}
            >
              Retake
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="jw-tap flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-line-strong bg-card py-3.5 text-[13px] font-bold text-ink-soft"
          disabled={uploading || captureDisabled}
          onClick={pick}
        >
          📷{" "}
          {uploading
            ? "Uploading…"
            : captureDisabled
              ? "Complete readiness first"
              : "Capture with tablet camera"}
        </button>
      )}
      <CaptureInlineError
        show={showValidation && !image}
        message={validationMessage ?? `${label} is required.`}
      />
      <CaptureInlineError show={Boolean(uploadError)} message={uploadError} />
      {zoom && image ? (
        <div
          className="fixed inset-0 z-[90] flex cursor-zoom-out flex-col items-center justify-center bg-[rgba(12,13,16,0.85)] p-6"
          onClick={() => setZoom(false)}
          onKeyDown={(e) => e.key === "Escape" && setZoom(false)}
          role="presentation"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={label}
            className="max-h-[80%] max-w-[94%] rounded-xl bg-white"
          />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="rounded-[11px] bg-card px-5 py-3 text-sm font-bold text-ink"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(false);
                onRetake();
                pick();
              }}
            >
              ↺ Retake
            </button>
            <button
              type="button"
              className="rounded-[11px] bg-white/15 px-5 py-3 text-sm font-bold text-white"
              onClick={() => setZoom(false)}
            >
              Looks good
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
