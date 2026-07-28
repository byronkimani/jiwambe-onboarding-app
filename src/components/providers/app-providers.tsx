"use client";

import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";

export function AppProviders({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SessionProvider>
      <div className={cn("flex min-h-dvh flex-1 flex-col", className)}>
        {children}
      </div>
    </SessionProvider>
  );
}
