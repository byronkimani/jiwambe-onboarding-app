"use client";

import Link from "next/link";
import { JiwambeOnboardingLogomark } from "@/components/branding/jiwambe-onboarding-logomark";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/lib/global/shared/routes";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="bg-accent-deep px-6 py-5 text-center">
        <JiwambeOnboardingLogomark size={36} className="mx-auto text-white" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <div className="card-shadow w-full max-w-sm rounded-[20px] bg-card px-5 py-8">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft"
            aria-hidden
          >
            <span className="text-2xl">📡</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">You&apos;re offline</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Check your connection and try again. Queued capture steps sync when
            you&apos;re back online.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
          <p className="mt-4">
            <Link
              href={AppRoutes.home}
              className="text-sm font-semibold text-accent-deep hover:text-accent"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
