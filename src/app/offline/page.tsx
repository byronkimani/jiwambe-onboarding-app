"use client";

import Link from "next/link";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";

export default function OfflinePage() {
  return (
    <AuthScreenLayout>
      <div className="text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-2xl"
          aria-hidden
        >
          📡
        </div>
        <h1 className="mt-4 font-display text-[22px] text-ink">No connection</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          This app needs an internet connection. Check Wi‑Fi or mobile data, then
          try again. Your work is not saved while offline.
        </p>
        <ProtoBtn className="mt-6 w-full" onClick={() => window.location.reload()}>
          Try again
        </ProtoBtn>
        <p className="mt-4 text-[13px]">
          <Link
            href={AppRoutes.home}
            className="font-semibold text-accent-deep underline-offset-2 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </AuthScreenLayout>
  );
}
