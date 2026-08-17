"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { LifelineStrip } from "@/components/onboarding/desk/lifeline-strip";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { DocumentSlot } from "@/components/onboarding/atoms/document-slot";
import { ProtoBtn, ProtoInput, ProtoTextarea } from "@/components/onboarding/atoms/proto-field";
import { CeremonyFooterActions } from "@/components/onboarding/flows/ceremony-footer-actions";
import { StickerSmsBtn } from "@/components/onboarding/flows/sticker-sms-btn";
import { ReasonModal } from "@/components/onboarding/chrome/reason-modal";
import {
  PDI_ITEMS,
  RELEASE_OTP_DEMO,
} from "@/lib/onboarding/flows/release-constants";
import { AppRoutes } from "@/lib/global/shared/routes";
import {
  apiReleaseComplete,
  apiReleaseSendOtp,
} from "@/lib/onboarding/ceremony/ceremony-api";
import { uploadApplicationDocument } from "@/lib/onboarding/documents/upload-application-document";
import { toast } from "sonner";

function TickRow({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`jw-tap rounded-lg border px-3 py-2 text-left text-[12.5px] font-semibold ${on ? "border-accent bg-accent-soft text-accent-deep" : "border-line bg-card-deep text-ink-soft"}`}
    >
      {on ? "✓ " : ""}
      {label}
    </button>
  );
}

export function ReleaseFlow({
  app,
  applicationRef,
  handoverPhotoUrl,
  onApplicationUpdated,
}: {
  app: OnboardingApplication;
  applicationRef: string;
  handoverPhotoUrl?: string | null;
  onApplicationUpdated?: () => void;
}) {
  const [pdi, setPdi] = useState<Record<string, boolean>>({});
  const [conf, setConf] = useState<Record<string, boolean>>({});
  const [handoverPhoto, setHandoverPhoto] = useState<string | null>(
    handoverPhotoUrl ?? null,
  );
  const [handoverDocId, setHandoverDocId] = useState<string | null>(null);
  const [handoverUploading, setHandoverUploading] = useState(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [released, setReleased] = useState(app.state === "ACTIVE_LOAN");
  const [busy, setBusy] = useState(false);
  const [defectOpen, setDefectOpen] = useState(false);
  const [defectDesc, setDefectDesc] = useState("");
  const [defectPhoto, setDefectPhoto] = useState<string | null>(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [disqualifyModalOpen, setDisqualifyModalOpen] = useState(false);

  useEffect(() => {
    void apiReleaseSendOtp(applicationRef);
  }, [applicationRef]);

  const bike = app.bike;
  if (!bike) {
    return (
      <p className="p-8 text-sm text-ink-soft">No bike assigned for release.</p>
    );
  }

  const pdiDone = PDI_ITEMS.filter((i) => pdi[i.k]).length;
  const pdiOk = pdiDone === PDI_ITEMS.length;
  const confirmItems = [
    { k: "assetId", label: `Assigned bike ID confirmed — ${bike.reg}` },
    { k: "assetMatch", label: "Asset details match the Operations record" },
    { k: "clientMatch", label: "Client details match the onboarding record" },
    { k: "releaseLog", label: "Client signed the asset release log" },
  ];
  const confOk = confirmItems.every((i) => conf[i.k]);
  const otpOk = otp.length >= 4;
  const canRelease = pdiOk && confOk && handoverDocId && otpOk && !busy;

  async function captureHandover(file: File) {
    setHandoverUploading(true);
    setHandoverError(null);
    const preview = URL.createObjectURL(file);
    setHandoverPhoto(preview);
    try {
      const uploaded = await uploadApplicationDocument({
        applicationId: applicationRef,
        purpose: "handover_photo",
        file,
      });
      setHandoverPhoto(uploaded.url);
      setHandoverDocId(uploaded.documentId);
      onApplicationUpdated?.();
    } catch {
      setHandoverError("Upload failed. Try again.");
      setHandoverPhoto(null);
      setHandoverDocId(null);
    } finally {
      setHandoverUploading(false);
    }
  }

  async function confirmRelease() {
    setBusy(true);
    const result = await apiReleaseComplete(applicationRef, {
      otp,
      pdi,
      confirmations: conf,
      handoverDocumentId: handoverDocId ?? undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not complete release.");
      return;
    }
    setReleased(true);
    onApplicationUpdated?.();
  }

  if (released) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col bg-paper">
        <OnboardingTopBar customerName={app.name} />
        <div className="mx-auto max-w-[620px] px-9 py-16 text-center">
          <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-[22px] bg-ink text-3xl">
            🏍️
          </div>
          <h1 className="font-display text-[25px] font-normal text-ink">
            Bike released — loan active
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {bike.reg} handed to {app.name}. Pre-release inspection passed, receipt
            confirmed by OTP from their registered SIM, and the handover photo is on
            file.
          </p>
          <p className="mt-2 font-mono text-[12.5px] font-semibold text-accent-deep">
            State → ACTIVE_LOAN · {app.lmsId}
          </p>
          <Link href={AppRoutes.desk} className="inline-block">
            <ProtoBtn>Back to worklist</ProtoBtn>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <OnboardingTopBar customerName={app.name} />
      <div className="flex-1 overflow-y-auto px-9 py-8">
        <div className="animate-fade-up mx-auto max-w-[680px]">
          <h1 className="font-display text-[25px] font-normal text-ink">
            Bike release — {app.name}
          </h1>
          <LifelineStrip state={app.state} />
          <div className="h-[18px]" />

          <div className="mb-3.5 rounded-2xl bg-rail p-5 text-white">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-mint">
              Assigned bike
            </p>
            <p className="mt-1.5 font-mono text-2xl font-bold tracking-wide">
              {bike.reg}
            </p>
            <p className="mt-1 text-[13px] text-white/65">
              {bike.model} · {bike.color}
              {bike.sticker ? ` · sticker ${bike.sticker}` : ""}
            </p>
            {bike.sticker ? (
              <div className="mt-3 flex items-center gap-3">
                <StickerSmsBtn phone={app.phone} />
              </div>
            ) : null}
          </div>

          <div className="mb-3.5 rounded-2xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] font-bold text-ink">
                Pre-release inspection
              </p>
              <span className="font-mono text-xs font-extrabold text-ink-faint">
                {pdiDone} / {PDI_ITEMS.length}
              </span>
            </div>
            <p className="mt-1 mb-3 text-[13px] leading-relaxed text-ink-soft">
              Physically check each item on {bike.reg} before it leaves.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PDI_ITEMS.map((i) => (
                <TickRow
                  key={i.k}
                  label={i.label}
                  on={Boolean(pdi[i.k])}
                  onClick={() => setPdi({ ...pdi, [i.k]: !pdi[i.k] })}
                />
              ))}
            </div>
            <ProtoBtn
              small
              ghost
              className="mt-3"
              onClick={() =>
                setPdi(Object.fromEntries(PDI_ITEMS.map((i) => [i.k, true])))
              }
            >
              Mark all PDI (demo)
            </ProtoBtn>
            <button
              type="button"
              className="jw-tap mt-3 block text-[13px] font-bold text-red"
              onClick={() => setDefectOpen((open) => !open)}
            >
              Something&apos;s wrong with this bike — report a defect
            </button>
            {defectOpen ? (
              <div className="mt-3 rounded-xl border border-line bg-card-deep p-4">
                <ProtoTextarea
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  placeholder="Describe the defect (min 6 characters)…"
                />
                <DocumentSlot
                  label="Photo of the defect"
                  image={defectPhoto}
                  onCapture={(file) =>
                    setDefectPhoto(URL.createObjectURL(file))
                  }
                  onRetake={() => setDefectPhoto(null)}
                />
                <div className="mt-3 flex gap-2">
                  <ProtoBtn small ghost onClick={() => setDefectOpen(false)}>
                    Cancel
                  </ProtoBtn>
                  <ProtoBtn
                    small
                    danger
                    disabled={defectDesc.trim().length < 6}
                    onClick={() => {
                      toast.message("Defect reported — replacement bike requested.");
                      setDefectOpen(false);
                    }}
                  >
                    Save & request replacement bike
                  </ProtoBtn>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mb-3.5 rounded-2xl border border-line bg-card p-5">
            <p className="text-[14.5px] font-bold text-ink">Confirmations</p>
            <div className="mt-3 space-y-2">
              {confirmItems.map((i) => (
                <TickRow
                  key={i.k}
                  label={i.label}
                  on={Boolean(conf[i.k])}
                  onClick={() => setConf({ ...conf, [i.k]: !conf[i.k] })}
                />
              ))}
            </div>
          </div>

          <div className="mb-3.5 rounded-2xl border border-line bg-card p-5">
            <DocumentSlot
              label="Officer + customer with bike"
              required
              preferCamera
              image={handoverPhoto}
              uploading={handoverUploading}
              uploadError={handoverError}
              onCapture={(file) => void captureHandover(file)}
              onRetry={() => {
                /* retake clears local state only */
                setHandoverPhoto(null);
                setHandoverDocId(null);
              }}
              onRetake={() => {
                setHandoverPhoto(null);
                setHandoverDocId(null);
              }}
            />
          </div>

          <div className="mb-3.5 rounded-2xl border border-line bg-card p-5">
            <p className="text-[14.5px] font-bold text-ink">Customer OTP</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              OTP sent to registered SIM (demo: {RELEASE_OTP_DEMO}).
            </p>
            <ProtoInput
              className="mt-3 max-w-xs"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              aria-label="Release OTP"
            />
          </div>

          <ProtoBtn disabled={!canRelease} onClick={() => void confirmRelease()}>
            {busy ? "Releasing…" : "Confirm bike release"}
          </ProtoBtn>
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
