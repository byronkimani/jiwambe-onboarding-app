"use client";

import { useRef, useState } from "react";
import { ProtoTag } from "@/components/onboarding/atoms/proto-tag";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";
import { isPdfMime } from "@/lib/onboarding/documents/document-purposes";
import { resolveCaptureUploadMime } from "@/lib/onboarding/documents/document-purposes";

export const DOCUMENT_SLOT_ACCEPT =
  "image/*,application/pdf,.heic,.heif,.pdf,.tiff,.tif";

type DocumentSlotProps = {
  label: string;
  required?: boolean;
  image?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  onCapture: (file: File) => void;
  onRetake: () => void;
  onRetry?: () => void;
  captureDisabled?: boolean;
  showValidation?: boolean;
  validationMessage?: string | null;
  uploading?: boolean;
  uploadError?: string | null;
  /** When true, prefer camera capture on mobile (photos only). */
  preferCamera?: boolean;
};

export function DocumentSlot({
  label,
  required,
  image,
  fileName,
  contentType,
  onCapture,
  onRetake,
  onRetry,
  captureDisabled = false,
  showValidation = false,
  validationMessage,
  uploading = false,
  uploadError = null,
  preferCamera = false,
}: DocumentSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(false);

  const isPdf =
    (contentType && isPdfMime(contentType)) ||
    (fileName?.toLowerCase().endsWith(".pdf") ?? false) ||
    (image?.toLowerCase().includes(".pdf") ?? false);

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
        accept={preferCamera ? "image/*" : DOCUMENT_SLOT_ACCEPT}
        capture={preferCamera ? "environment" : undefined}
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
          {isPdf ? (
            <div className="flex h-[120px] w-full flex-col items-center justify-center rounded-[10px] border border-line bg-white px-3 text-center">
              <span className="text-2xl">PDF</span>
              <span className="mt-1 truncate text-xs text-ink-soft">
                {fileName ?? "Document attached"}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="block w-full"
              onClick={() => setZoom(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={label}
                className="h-[120px] w-full cursor-zoom-in rounded-[10px] border border-line bg-white object-cover"
              />
            </button>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
            {uploadError && onRetry ? (
              <button
                type="button"
                className="text-xs font-bold text-red-600"
                onClick={onRetry}
              >
                Retry upload
              </button>
            ) : null}
            <button
              type="button"
              className="text-xs font-bold text-accent-deep"
              onClick={onRetake}
            >
              Retake
            </button>
          </div>
          {uploadError ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={captureDisabled || uploading}
          onClick={pick}
          className="flex h-[120px] w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-line bg-white text-ink-soft disabled:opacity-50"
        >
          <span className="text-2xl">+</span>
          <span className="mt-1 text-xs font-semibold">
            {uploading ? "Uploading…" : "Add photo or PDF"}
          </span>
        </button>
      )}
      <CaptureInlineError show={showValidation} message={validationMessage} />
      {zoom && image && !isPdf ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoom(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={label}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </button>
      ) : null}
    </div>
  );
}

export function contentTypeFromFile(file: File): string {
  return resolveCaptureUploadMime(file);
}
