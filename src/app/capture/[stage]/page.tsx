import { CaptureStageScreen } from "@/components/onboarding/capture/capture-stage-screen";
import {
  CAPTURE_STAGE_KEYS,
  isCaptureStageKey,
} from "@/lib/global/shared/routes";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ stage: string }> };

export function generateStaticParams() {
  return CAPTURE_STAGE_KEYS.map((stage) => ({ stage }));
}

export default async function CaptureStagePage({ params }: Props) {
  const { stage } = await params;
  if (!isCaptureStageKey(stage)) {
    notFound();
  }
  return <CaptureStageScreen stage={stage} />;
}
