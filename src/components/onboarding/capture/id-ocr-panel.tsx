"use client";

/* OCR demo UI disabled — restore when ID extraction is wired to a real service.

import { useState } from "react";

type Props = {
  onApplied: (fields: { name: string; idNo: string }) => void;
};

export function IdOcrPanel({ onApplied }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function runOcr() {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
      onApplied({ name: "James Mwangi Kariuki", idNo: "2984 1170" });
    }, 1200);
  }

  return (
    <div className="mt-4 rounded-2xl border border-line bg-card-deep p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">
        ID OCR (demo)
      </p>
      {done ? (
        <p className="mt-2 text-sm font-semibold text-accent-deep">
          ✓ Extracted fields applied — verify against the physical ID.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">
            Simulated OCR reads the ID photo and pre-fills fields for officer
            verification.
          </p>
          <button
            type="button"
            className="jw-tap mt-3 rounded-[11px] bg-accent px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
            disabled={loading}
            onClick={runOcr}
          >
            {loading ? "Reading ID…" : "Run OCR on photo"}
          </button>
        </>
      )}
    </div>
  );
}
*/

type Props = {
  onApplied: (fields: { name: string; idNo: string }) => void;
};

export function IdOcrPanel(props: Props) {
  void props;
  return null;
}
