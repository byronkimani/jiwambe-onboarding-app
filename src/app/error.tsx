"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-12 text-center">
      <h1 className="font-display text-2xl text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-ink-soft">
        The error was reported automatically. Try again or return to your
        worklist.
      </p>
      <div className="mt-6 flex gap-3">
        <ProtoBtn ghost onClick={() => reset()}>
          Try again
        </ProtoBtn>
        <ProtoBtn onClick={() => window.location.assign(AppRoutes.desk)}>
          Go to desk
        </ProtoBtn>
      </div>
    </div>
  );
}
