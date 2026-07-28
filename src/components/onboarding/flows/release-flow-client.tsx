"use client";

import { useApplication } from "@/lib/onboarding/use-application";
import { ReleaseFlow } from "@/components/onboarding/flows/release-flow";

export function ReleaseFlowClient({ id }: { id: string }) {
  const { application, loading, error } = useApplication(id);
  if (loading) return <p className="p-8 text-sm text-ink-soft">Loading…</p>;
  if (error || !application) {
    return <p className="p-8 text-sm text-ink-soft">Application not found.</p>;
  }
  return <ReleaseFlow app={application} />;
}
