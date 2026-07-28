"use client";

import {
  isValidOfficerEmail,
  isValidOfficerPassword,
} from "@/lib/global/auth/demo-credentials";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { ProtoBtn, ProtoField, ProtoInput } from "@/components/onboarding/atoms/proto-field";

type Props = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onContinue: () => void;
};

export function OfficerLoginStep({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onContinue,
}: Props) {
  const valid =
    isValidOfficerEmail(email) && isValidOfficerPassword(password);

  return (
    <AuthScreenLayout>
      <div className="mb-[22px] flex items-center gap-[11px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-accent-deep font-display text-[17px] font-extrabold text-white">
          J
        </div>
        <div>
          <div className="text-[15px] font-extrabold text-ink">
            Jiwambe Onboarding
          </div>
          <div className="text-[11.5px] text-ink-faint">Officer sign-in</div>
        </div>
      </div>

      <ProtoField label="Email" required>
        <ProtoInput
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </ProtoField>

      <ProtoField label="Password" required hint="Minimum 8 characters.">
        <ProtoInput
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </ProtoField>

      <ProtoBtn
        className="w-full"
        disabled={!valid}
        onClick={onContinue}
      >
        Continue
      </ProtoBtn>

      <p className="mt-3.5 text-center text-xs leading-relaxed text-ink-faint">
        Accounts are created by Jiwambe backoffice for employees and contractors
        alike — no self sign-up.
      </p>
    </AuthScreenLayout>
  );
}
