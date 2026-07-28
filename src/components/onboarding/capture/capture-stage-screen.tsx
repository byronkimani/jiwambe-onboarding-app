"use client";

import { useRouter } from "next/navigation";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import {
  captureStagePath,
  nextCaptureStage,
  prevCaptureStage,
} from "@/lib/onboarding/capture/nav";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import { CaptureChromeLayout } from "@/components/onboarding/capture/capture-chrome-layout";
import { StageShell } from "@/components/onboarding/capture/stage-shell";
import { CaptureStageBody } from "@/components/onboarding/capture/stages/capture-stage-body";
import {
  captureStageCompleteMap,
  captureStageMeta,
} from "@/lib/onboarding/capture/capture-progress";
import { toast } from "sonner";

type Props = { stage: CaptureStageKey };

export function CaptureStageScreen({ stage }: Props) {
  const router = useRouter();
  const { form, patchForm } = useCaptureWizard();

  function goNext() {
    const next = nextCaptureStage(stage);
    if (!next) return;
    if (stage === "readiness" && !isReadinessComplete(form.readiness)) {
      toast.error("Complete every readiness item before continuing.");
      return;
    }
    if (stage === "lookup" && !form.customerFound) {
      toast.error("Select portal match or new customer.");
      return;
    }
    router.push(captureStagePath(next));
  }

  function goBack() {
    const prev = prevCaptureStage(stage);
    if (prev) {
      router.push(captureStagePath(prev));
      return;
    }
    router.push(AppRoutes.desk);
  }

  const meta = captureStageMeta(stage);
  const title = stage === "readiness" ? "Is the customer ready?" : meta.title;
  const sub = meta.sub;
  const completeMap = captureStageCompleteMap(form, stage);
  const readinessDone = isReadinessComplete(form.readiness);

  return (
    <CaptureChromeLayout
      stage={stage}
      completeMap={completeMap}
      customerName={form.name || undefined}
      onBack={goBack}
    >
      <StageShell
        title={title}
        sub={sub}
        onBack={goBack}
        onNext={stage !== "review" ? goNext : undefined}
        nextLabel={
          stage === "readiness"
            ? "Customer is ready — start"
            : stage === "review"
              ? undefined
              : "Continue"
        }
        nextDisabled={stage === "readiness" ? !readinessDone : undefined}
        onPause={
          stage !== "readiness" && stage !== "review"
            ? () => toast.message("Pause saved to drafts (demo).")
            : undefined
        }
      >
        <CaptureStageBody stage={stage} form={form} patchForm={patchForm} />
      </StageShell>
    </CaptureChromeLayout>
  );
}
