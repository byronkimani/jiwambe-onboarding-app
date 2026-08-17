"use client";

/* Face match demo UI disabled — restore when liveness/face match is wired to a real service.

import { useState } from "react";

export function FaceMatchPanel() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function runMatch() {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setScore(94);
    }, 900);
  }

  return (
    <div className="mt-4 rounded-2xl border border-line bg-blue-bg p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-blue">
        Face match (demo)
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Compare live selfie to ID portrait — threshold set by ops policy.
      </p>
      <button
        type="button"
        className="jw-tap mt-3 rounded-[11px] border border-line bg-card px-4 py-2.5 text-[13.5px] font-bold text-ink"
        disabled={loading}
        onClick={runMatch}
      >
        {loading ? "Matching…" : "Run face match"}
      </button>
      {score !== null ? (
        <p className="mt-2 text-sm font-bold text-accent-deep">
          Match {score}% — within policy
        </p>
      ) : null}
    </div>
  );
}
*/

export function FaceMatchPanel() {
  return null;
}
