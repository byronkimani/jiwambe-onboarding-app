"use client";

import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CaptureStepRail } from "@/components/onboarding/capture/capture-step-rail";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";

type CaptureChromeLayoutProps = {
  stage: CaptureStageKey;
  completeMap: Partial<Record<CaptureStageKey, boolean>>;
  customerName?: string;
  onBack?: () => void;
  children: React.ReactNode;
};

export function CaptureChromeLayout({
  stage,
  completeMap,
  customerName,
  onBack,
  children,
}: CaptureChromeLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-background">
      <OnboardingTopBar customerName={customerName} onBack={onBack} />
      <div className="flex min-h-0 flex-1">
        <CaptureStepRail current={stage} completeMap={completeMap} />
        <div className="min-w-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
