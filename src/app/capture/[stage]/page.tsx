import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaptureStageScreen } from "@/components/onboarding/capture/capture-stage-screen";
import {
  CAPTURE_STAGE_KEYS,
  isCaptureStageKey,
} from "@/lib/global/shared/routes";

type Props = { params: Promise<{ stage: string }> };

export function generateStaticParams() {
  return CAPTURE_STAGE_KEYS.map((stage) => ({ stage }));
}

export default async function CaptureStagePage({ params }: Props) {
  const { stage } = await params;
  if (!isCaptureStageKey(stage)) {
    notFound();
  }
  return (
    <Suspense
      fallback={
        <p className="px-5 py-4 text-sm text-ink-soft">Loading capture…</p>
      }
    >
      <CaptureStageScreen stage={stage} />
    </Suspense>
  );
}
