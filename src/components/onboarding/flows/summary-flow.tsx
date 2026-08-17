"use client";

import Link from "next/link";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { LifelineStrip } from "@/components/onboarding/desk/lifeline-strip";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { SectionCard } from "@/components/onboarding/atoms/section-card";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";

function SummarySection({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <SectionCard title={title}>
      <div className="grid grid-cols-2 gap-3">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-ink-faint">{label}</p>
              <p className="mt-0.5 text-[14.5px] font-bold text-ink">{value}</p>
            </div>
          ))}
      </div>
    </SectionCard>
  );
}

export function SummaryFlow({ app }: { app: OnboardingApplication }) {
  const journey: [string, string][] = [
    ["Captured in the field", "KYC, documents, deposit verified"],
    ["Ops review", "Approved and pushed to the LMS"],
    ["Agreement signed", "Client + officer dual signature · copy delivered by SMS"],
    [
      "Bike assigned",
      app.bike ? `${app.bike.reg} with sticker ${app.bike.sticker}` : "—",
    ],
    ["Released", "Receipt confirmed by OTP from the registered SIM"],
  ];

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <OnboardingTopBar customerName={app.name} />
      <div className="flex-1 overflow-y-auto px-9 py-8">
        <div className="animate-fade-up mx-auto max-w-[680px]">
          <h1 className="font-display text-[25px] font-normal text-ink">
            Application summary — {app.name}
          </h1>
          <LifelineStrip state={app.state} />
          <div className="h-[18px]" />

          <SummarySection
            title={`Applicant · ${app.id}`}
            rows={[
              ["Full name", app.name],
              ["Phone", app.phone],
              ["LMS record", app.lmsId ?? "—"],
            ]}
          />
          <SummarySection
            title="Product & financing"
            rows={[
              ["Product", app.product],
              ["Term", app.term],
              ["Deposit paid", formatKes(app.deposit)],
              ["Daily installment", formatKes(app.daily)],
            ]}
          />
          {app.bike ? (
            <SummarySection
              title="Asset & insurance"
              rows={[
                ["Registration", app.bike.reg],
                ["Model", `${app.bike.model} · ${app.bike.color}`],
                ["Insurance sticker", app.bike.sticker ?? "—"],
                ["Cover valid to", app.bike.stickerExpiry ?? "—"],
              ]}
            />
          ) : null}

          <div className="rounded-2xl border border-line bg-card p-[18px]">
            <p className="mb-3 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-faint">
              Journey
            </p>
            {journey.map(([title, desc], i) => {
              const last = i === journey.length - 1;
              return (
                <div key={title} className="flex gap-3">
                  <div className="flex w-3.5 flex-col items-center">
                    <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full border-[2.5px] border-accent bg-accent" />
                    {!last ? (
                      <div className="mt-1 w-0.5 flex-1 bg-accent-soft" />
                    ) : null}
                  </div>
                  <div className={last ? "pb-0.5" : "pb-4"}>
                    <p className="text-[13.5px] font-bold text-ink">{title}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link href={AppRoutes.desk} className="mt-4 inline-block">
            <ProtoBtn ghost>← Worklist</ProtoBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
