"use client";

import { useRouter } from "next/navigation";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";
import { useOnboardingChrome } from "@/components/onboarding/onboarding-chrome-context";
import { signOut } from "next-auth/react";

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-3 last:border-b-0">
      <span className="text-[13px] font-semibold text-ink-faint">{label}</span>
      <span className="text-[13.5px] font-bold text-ink">{value}</span>
    </div>
  );
}

export function OfficerProfilePage() {
  const router = useRouter();
  const { officer } = useOnboardingChrome();
  const initials = officer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <OnboardingTopBar customerName="Profile" />
      <div className="flex-1 overflow-y-auto px-9 py-8">
        <div className="animate-fade-up mx-auto max-w-[560px]">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-accent-deep text-[22px] font-extrabold text-white">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-2xl font-normal text-ink">
                {officer.name}
              </h1>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Onboarding officer · Contractor
              </p>
            </div>
          </div>

          <div className="mb-3.5 rounded-2xl border border-line bg-card px-[18px] py-1.5">
            <ProfileRow label="Email" value={officer.email} />
            <ProfileRow
              label="Registered phone (OTP + payouts)"
              value={officer.registeredPhone}
            />
            <ProfileRow label="National ID" value={officer.nationalIdMask} />
            <ProfileRow label="Dealership" value={officer.dealership} />
            <ProfileRow
              label="Access"
              value="Field capture · agreements · release"
            />
            <ProfileRow label="This device" value={officer.deviceLabel} />
            <ProfileRow label="Last sign-in" value={officer.lastSignIn} />
          </div>

          <div className="flex gap-2.5">
            <ProtoBtn ghost className="flex-1" onClick={() => router.push(AppRoutes.desk)}>
              ← Worklist
            </ProtoBtn>
            <ProtoBtn
              className="flex-1 bg-red-bg text-red"
              onClick={() => void signOut({ callbackUrl: AppRoutes.home })}
            >
              Sign out
            </ProtoBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
