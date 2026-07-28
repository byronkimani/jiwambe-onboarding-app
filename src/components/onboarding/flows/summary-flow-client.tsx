"use client";

import { useApplication } from "@/lib/onboarding/use-application";
import { SummaryFlow } from "@/components/onboarding/flows/summary-flow";

export function SummaryFlowClient({ id }: { id: string }) {
  const { application, loading, error } = useApplication(id);
  if (loading) return <p className="p-8 text-sm text-ink-soft">Loading…</p>;
  if (error || !application) {
    return <p className="p-8 text-sm text-ink-soft">Application not found.</p>;
  }
  return <SummaryFlow app={application} />;
}
