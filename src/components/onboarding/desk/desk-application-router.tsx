"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  captureStage,
  deskApplicationAgreement,
  deskApplicationRelease,
  deskApplicationSummary,
} from "@/lib/global/shared/routes";
import { useApplication } from "@/lib/onboarding/use-application";
import { primaryActionForState } from "@/lib/onboarding/application-helpers";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";
import { firstIncompleteCaptureStage } from "@/lib/onboarding/capture/first-incomplete-capture-stage";

export function DeskApplicationRouter({ id }: { id: string }) {
  const router = useRouter();
  const { application, resource, loading, error } = useApplication(id);

  useEffect(() => {
    if (loading || error || !application || !resource) return;

    const action = primaryActionForState(application.state);
    if (action === "agreement") {
      router.replace(deskApplicationAgreement(id));
      return;
    }
    if (action === "release") {
      router.replace(deskApplicationRelease(id));
      return;
    }
    if (action === "summary") {
      router.replace(deskApplicationSummary(id));
      return;
    }
    if (action === "resume") {
      const form = hydrateCaptureFormFromResource(resource);
      const target = firstIncompleteCaptureStage(form);
      router.replace(captureStage(target, resource.referenceCode));
      return;
    }

    router.replace(deskApplicationSummary(id));
  }, [application, resource, loading, error, id, router]);

  if (loading) {
    return (
      <p className="p-8 text-sm text-ink-soft">Loading application…</p>
    );
  }

  if (error || !application) {
    return (
      <p className="p-8 text-sm text-ink-soft">Application not found.</p>
    );
  }

  return (
    <p className="p-8 text-sm text-ink-soft">Opening application…</p>
  );
}
