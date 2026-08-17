"use client";

import { useState } from "react";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { LifelineStrip } from "@/components/onboarding/desk/lifeline-strip";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { AgreementViewer } from "@/components/onboarding/flows/agreement-viewer";
import { CeremonyFooterActions } from "@/components/onboarding/flows/ceremony-footer-actions";
import { SignaturePad } from "@/components/onboarding/atoms/signature-pad";
import { ReasonModal } from "@/components/onboarding/chrome/reason-modal";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";
import { apiAgreementAction } from "@/lib/onboarding/ceremony/ceremony-api";
import { toast } from "sonner";

type Step = "summary" | "generating" | "generated" | "signed" | "sending" | "sent";

function FlowPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 rounded-2xl border border-line bg-card p-5">
      {children}
    </div>
  );
}

export function AgreementFlow({
  app,
  applicationRef,
  onApplicationUpdated,
}: {
  app: OnboardingApplication;
  applicationRef: string;
  onApplicationUpdated?: () => void;
}) {
  const [step, setStep] = useState<Step>("summary");
  const [readDone, setReadDone] = useState(false);
  const [clientSigned, setClientSigned] = useState(false);
  const [officerSigned, setOfficerSigned] = useState(false);
  const [smsOpened, setSmsOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [disqualifyModalOpen, setDisqualifyModalOpen] = useState(false);

  const generatedOn = ["generated", "signed", "sending", "sent"].includes(step);
  const signedOn = ["signed", "sending", "sent"].includes(step);

  async function generate() {
    setStep("generating");
    setBusy(true);
    const result = await apiAgreementAction(applicationRef, { action: "generate" });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not generate agreement.");
      setStep("summary");
      return;
    }
    onApplicationUpdated?.();
    setStep("generated");
  }

  async function captureOfficerSignature() {
    setBusy(true);
    const result = await apiAgreementAction(applicationRef, {
      action: "sign",
      clientSigned: true,
      officerSigned: true,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not record signatures.");
      return;
    }
    setClientSigned(true);
    setOfficerSigned(true);
    setStep("signed");
    onApplicationUpdated?.();
  }

  async function sendSms() {
    setStep("sending");
    setBusy(true);
    const result = await apiAgreementAction(applicationRef, { action: "send_sms" });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not send SMS copy.");
      setStep("signed");
      return;
    }
    setStep("sent");
    setSmsOpened(true);
    onApplicationUpdated?.();
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <OnboardingTopBar customerName={app.name} />
      <div className="flex-1 overflow-y-auto px-9 py-8">
        <div className="animate-fade-up mx-auto max-w-[680px]">
          <h1 className="font-display text-[25px] font-normal text-ink">
            Loan agreement — {app.name}
          </h1>
          <LifelineStrip state={smsOpened ? "AGREEMENT_SIGNED" : app.state} />
          <div className="h-[18px]" />

          <FlowPanel>
            <p className="text-[11.5px] font-extrabold uppercase tracking-wide text-ink-faint">
              From the LMS · {app.lmsId}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-3.5">
              {(
                [
                  ["Product", app.product],
                  ["Term", app.term],
                  ["Deposit (verified)", formatKes(app.deposit)],
                  ["Daily installment", formatKes(app.daily)],
                  [
                    "Assigned bike",
                    app.bike ? `${app.bike.reg} · ${app.bike.color}` : "—",
                  ],
                  [
                    "Insurance sticker",
                    app.bike?.sticker ?? "—",
                  ],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-bold text-ink-faint">{label}</p>
                  <p className="mt-0.5 text-[15px] font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
            {app.opsNote ? (
              <p className="mt-3.5 rounded-[10px] bg-accent-soft px-3 py-2 text-[12.5px] font-semibold text-accent-deep">
                Ops: {app.opsNote}
              </p>
            ) : null}
          </FlowPanel>

          <FlowPanel>
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] font-bold text-ink">1 · Generate agreement</p>
              {generatedOn ? (
                <span className="text-[12.5px] font-extrabold text-accent-deep">
                  ✓ Done
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Populated from the Loan Management System record — figures above are
              what will appear in the document.
            </p>
            {step === "summary" ? (
              <ProtoBtn small className="mt-3" disabled={busy} onClick={() => void generate()}>
                Generate agreement PDF
              </ProtoBtn>
            ) : null}
            {step === "generating" ? (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-bold text-amber">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                Generating from LMS data…
              </p>
            ) : null}
          </FlowPanel>

          {generatedOn ? (
            <FlowPanel>
              <div className="flex items-center justify-between">
                <p className="text-[14.5px] font-bold text-ink">
                  2 · Customer reviews the agreement
                </p>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">
                Hand the tablet to the customer. Signing unlocks only after the full
                document has been scrolled — the review is logged with the signature.
              </p>
              <AgreementViewer
                app={app}
                readDone={readDone}
                onReadToEnd={() => setReadDone(true)}
              />
            </FlowPanel>
          ) : null}

          {generatedOn ? (
            <FlowPanel>
              <div className="flex items-center justify-between">
                <p className="text-[14.5px] font-bold text-ink">
                  3 · Dual signature — client, then officer
                </p>
                {signedOn ? (
                  <span className="text-[12.5px] font-extrabold text-accent-deep">
                    ✓ Both signed
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                The customer signs first as borrower; the officer countersigns as
                company representative on the same ceremony.
              </p>
              <div className="mt-3.5 grid grid-cols-2 gap-3">
                {(
                  [
                    ["Client — borrower", clientSigned, app.name, "client"],
                    ["Officer — company rep", officerSigned, app.officer, "officer"],
                  ] as const
                ).map(([role, signed, who, kind]) => (
                  <div
                    key={role}
                    className={`rounded-xl border-[1.5px] p-3 ${signed ? "border-accent bg-accent-soft" : "border-line bg-card-deep"}`}
                  >
                    <p
                      className={`text-[11px] font-extrabold uppercase tracking-wide ${signed ? "text-accent-deep" : "text-ink-faint"}`}
                    >
                      {role}
                    </p>
                    {signed && clientSignature && kind === "client" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={clientSignature}
                        alt={`${who} signature`}
                        className="mt-2 h-16 w-full rounded-lg border border-line bg-white object-contain"
                      />
                    ) : signed && kind === "officer" ? (
                      <div className="mt-2 flex h-16 items-center justify-center rounded-lg border border-line bg-white text-xs text-ink-faint">
                        Signed · {who}
                      </div>
                    ) : !signed && kind === "client" && readDone ? (
                      <div className="mt-2">
                        <SignaturePad
                          onDone={(dataUrl) => {
                            setClientSignature(dataUrl);
                            setClientSigned(true);
                          }}
                        />
                      </div>
                    ) : !signed && kind === "officer" && clientSigned ? (
                      <div className="mt-2">
                        <SignaturePad
                          onDone={() => void captureOfficerSignature()}
                        />
                      </div>
                    ) : (
                      <div className="mt-2 flex h-16 items-center justify-center rounded-lg border border-line bg-white text-xs text-ink-faint">
                        {kind === "officer" && !clientSigned
                          ? "Awaiting client signature"
                          : !readDone
                            ? "Read agreement first"
                            : "Awaiting signature"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FlowPanel>
          ) : null}

          {signedOn ? (
            <FlowPanel>
              <p className="text-[14.5px] font-bold text-ink">
                4 · Send copy by SMS
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                Customer receives a link to the executed PDF on their registered
                phone.
              </p>
              {step === "signed" ? (
                <ProtoBtn small className="mt-3" disabled={busy} onClick={() => void sendSms()}>
                  Send SMS copy
                </ProtoBtn>
              ) : null}
              {step === "sending" ? (
                <p className="mt-3 text-sm font-bold text-amber">Sending…</p>
              ) : null}
              {step === "sent" ? (
                <p className="mt-3 text-sm font-extrabold text-accent-deep">
                  ✓ Copy sent — agreement filed
                </p>
              ) : null}
            </FlowPanel>
          ) : null}

          <CeremonyFooterActions
            backHref={AppRoutes.desk}
            onPause={() => setPauseModalOpen(true)}
            onDisqualify={() => setDisqualifyModalOpen(true)}
          />
        </div>
      </div>
      <ReasonModal
        open={pauseModalOpen}
        title="Pause application"
        hint="Save progress and return to drafts."
        confirmLabel="Pause"
        onConfirm={() => setPauseModalOpen(false)}
        onCancel={() => setPauseModalOpen(false)}
      />
      <ReasonModal
        open={disqualifyModalOpen}
        title="Disqualify application"
        hint="This closes the application."
        confirmLabel="Disqualify"
        tone="danger"
        onConfirm={() => setDisqualifyModalOpen(false)}
        onCancel={() => setDisqualifyModalOpen(false)}
      />
    </div>
  );
}
