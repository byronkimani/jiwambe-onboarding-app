"use client";

import { useRef, useState } from "react";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { AGREEMENT_SECTIONS } from "@/lib/onboarding/flows/agreement-content";
import { AgreementExplainer } from "@/components/onboarding/flows/agreement-explainer";

type Props = {
  app: OnboardingApplication;
  readDone: boolean;
  onReadToEnd: () => void;
};

export function AgreementViewer({ app, readDone, onReadToEnd }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);

  function onScroll() {
    const el = boxRef.current;
    if (!el) return;
    const p = Math.min(
      100,
      Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100),
    );
    setPct(p);
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      onReadToEnd();
    }
  }

  return (
    <div>
      <div
        ref={boxRef}
        onScroll={onScroll}
        className="h-[220px] overflow-y-auto rounded-xl border border-line bg-white px-5 py-4"
      >
        <p className="font-display text-[17px] text-ink">
          Asset Financing Agreement
        </p>
        <p className="mb-3.5 font-mono text-[11.5px] text-ink-faint">
          {app.lmsId} · {app.name} · {app.product} · {app.term} ·{" "}
          {formatKes(app.daily)}/day
          {app.bike ? ` · ${app.bike.reg}` : ""}
        </p>
        {AGREEMENT_SECTIONS.map(([heading, body]) => (
          <div key={heading} className="mb-3">
            <p className="text-[12.5px] font-extrabold text-ink">{heading}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
              {body}
            </p>
          </div>
        ))}
        <p className="mt-1 border-t border-line pt-3 text-[11.5px] text-ink-faint">
          — End of agreement. Signature fields follow on the executed PDF. —
        </p>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-[width] duration-200"
            style={{
              width: `${pct}%`,
              background: readDone ? "var(--accent)" : "var(--amber)",
            }}
          />
        </div>
        <span
          className={`whitespace-nowrap text-xs font-bold ${readDone ? "text-accent-deep" : "text-amber"}`}
        >
          {readDone ? "✓ Reviewed to the end" : "Scroll to the end to enable signing"}
        </span>
      </div>
      <AgreementExplainer />
    </div>
  );
}
