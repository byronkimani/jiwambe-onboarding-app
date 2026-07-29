import { Suspense } from "react";
import { ActivateAccountScreen } from "@/components/auth/activate-account-screen";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-accent-deep text-white">
          Loading…
        </div>
      }
    >
      <ActivateAccountScreen />
    </Suspense>
  );
}
