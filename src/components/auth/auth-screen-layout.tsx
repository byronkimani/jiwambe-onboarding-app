"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function AuthScreenBrand() {
  return (
    <div className="mb-[22px] flex items-center gap-[11px]">
      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-accent-deep font-display text-[17px] font-extrabold text-white">
        J
      </div>
      <div>
        <p className="text-[15px] font-extrabold text-ink">Jiwambe Onboarding</p>
        <p className="text-[11.5px] text-ink-faint">Officer sign-in</p>
      </div>
    </div>
  );
}

export function AuthScreenLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-rail p-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className={cn(
            "fade-up w-full max-w-[400px] rounded-[22px] bg-paper px-7 py-[30px] animate-fade-up",
            className,
          )}
        >
          <AuthScreenBrand />
          {children}
        </div>
      </div>
    </div>
  );
}
