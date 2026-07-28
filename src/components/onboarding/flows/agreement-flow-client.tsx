"use client";

import { useApplication } from "@/lib/onboarding/use-application";
import { AgreementFlow } from "@/components/onboarding/flows/agreement-flow";

export function AgreementFlowClient({ id }: { id: string }) {
  const { application, loading, error } = useApplication(id);
  if (loading) return <p className="p-8 text-sm text-ink-soft">Loading…</p>;
  if (error || !application) {
    return <p className="p-8 text-sm text-ink-soft">Application not found.</p>;
  }
  return <AgreementFlow app={application} />;
}
