"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
          {children}
        </div>
      </div>
    </div>
  );
}
