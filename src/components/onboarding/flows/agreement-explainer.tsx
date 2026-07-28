"use client";

import { useState } from "react";
import { EXPLAINER_QA } from "@/lib/onboarding/flows/agreement-content";

export function AgreementExplainer() {
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div className="mt-3.5 rounded-[14px] bg-blue-bg p-3.5">
      <p className="text-xs font-extrabold uppercase tracking-wide text-blue">
        Customer questions (demo)
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        Answers only quote the agreement — they never interpret or advise beyond
        it.
      </p>
      <ul className="mt-3 space-y-2">
        {EXPLAINER_QA.map((item) => (
          <li key={item.q}>
            <button
              type="button"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-left text-[13px] font-bold text-ink"
              onClick={() => setOpenQ(openQ === item.q ? null : item.q)}
            >
              {item.q}
            </button>
            {openQ === item.q ? (
              <p className="mt-1 px-1 text-xs leading-relaxed text-ink-soft">
                {item.a}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
