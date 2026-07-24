"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset="6rem"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-accent-deep/25 bg-accent-deep text-white shadow-[0_10px_28px_rgba(18,62,49,0.35)]",
          description: "text-white/85",
          actionButton: "bg-white/15 text-white",
          cancelButton: "bg-white/10 text-white",
        },
      }}
    />
  );
}
