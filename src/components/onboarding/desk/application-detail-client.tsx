"use client";

import Link from "next/link";
import { useApplication } from "@/lib/onboarding/use-application";
import {
  deskApplicationAgreement,
  deskApplicationRelease,
  deskApplicationSummary,
} from "@/lib/global/shared/routes";
import { primaryActionForState } from "@/lib/onboarding/application-helpers";
import { ApplicationFolderCard } from "@/components/onboarding/desk/application-folder-card";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { AppRoutes } from "@/lib/global/shared/routes";
import { Button } from "@/components/ui/button";

export function ApplicationDetailClient({ id }: { id: string }) {
  const { application, loading, error } = useApplication(id);

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

  const action = primaryActionForState(application.state);
  const actionHref =
    action === "agreement"
      ? deskApplicationAgreement(id)
      : action === "release"
        ? deskApplicationRelease(id)
        : action === "summary"
          ? deskApplicationSummary(id)
          : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <OnboardingTopBar customerName={application.name} />
      <div className="px-5 py-6">
        <ApplicationFolderCard app={application} />
        {actionHref ? (
          <Button asChild className="mt-4">
            <Link href={actionHref}>Continue flow</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" className="mt-4 ml-3">
          <Link href={AppRoutes.desk}>Back to desk</Link>
        </Button>
      </div>
    </div>
  );
}
