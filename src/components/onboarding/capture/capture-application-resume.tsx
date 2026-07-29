"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  captureStage,
  type CaptureStageKey,
} from "@/lib/global/shared/routes";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import { firstIncompleteCaptureStage } from "@/lib/onboarding/capture/first-incomplete-capture-stage";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";

type Props = {
  stage: CaptureStageKey;
};

export function CaptureApplicationResume({ stage }: Props) {
  const searchParams = useSearchParams();
  const applicationRef = searchParams.get("application");
  const router = useRouter();
  const {
    referenceCode,
    resumeApplication,
    resumeLoading,
    resumeError,
    apiError,
  } = useCaptureWizard();

  useEffect(() => {
    if (!applicationRef) return;
    if (referenceCode === applicationRef) return;

    let cancelled = false;
    void (async () => {
      const result = await resumeApplication(applicationRef);
      if (cancelled || !result.ok) return;

      const form = hydrateCaptureFormFromResource(result.application);
      const target = firstIncompleteCaptureStage(form);
      if (target !== stage) {
        router.replace(captureStage(target, applicationRef));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applicationRef, referenceCode, resumeApplication, router, stage]);

  if (!applicationRef) {
    return null;
  }

  if (resumeLoading && referenceCode !== applicationRef) {
    return (
      <p className="px-5 py-4 text-sm text-ink-soft">Loading application…</p>
    );
  }

  const message = resumeError ?? apiError;
  if (message && referenceCode !== applicationRef) {
    return <p className="px-5 py-4 text-sm text-destructive">{message}</p>;
  }

  return null;
}
