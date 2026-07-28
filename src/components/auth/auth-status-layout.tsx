import type { ReactNode } from "react";
import { JiwambeOnboardingLogomark } from "@/components/branding/jiwambe-onboarding-logomark";

type AuthStatusLayoutProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  icon: ReactNode;
  children?: ReactNode;
};

export function AuthStatusLayout({
  eyebrow,
  title,
  description,
  icon,
  children,
}: AuthStatusLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col bg-accent-deep text-white">
      <div className="px-[26px] pt-12">
        <div className="flex items-center gap-2.5">
          <JiwambeOnboardingLogomark size={40} className="text-white" />
          <span className="text-[15px] font-extrabold tracking-wide">
            JIWAMBE
          </span>
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-volt/90">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-[32px] leading-[1.16]">{title}</h1>
      </div>

      <div className="mt-auto rounded-t-[26px] bg-background px-6 pb-8 pt-6 text-ink">
        <div className="mb-6 flex justify-center">{icon}</div>
        <div className="text-[15px] leading-relaxed text-ink-soft">
          {description}
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}
