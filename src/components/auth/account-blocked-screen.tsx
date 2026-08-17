import Link from "next/link";
import { AuthStatusLayout } from "@/components/auth/auth-status-layout";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { ONBOARDING_SUPPORT } from "@/lib/global/auth/support-contact";
import { AppRoutes } from "@/lib/global/shared/routes";

export function AccountBlockedScreen() {
  const whatsAppUrl = `https://wa.me/${ONBOARDING_SUPPORT.whatsApp}`;

  return (
    <AuthStatusLayout
      eyebrow="Sign-in issue"
      title="We couldn't sign you in"
      description={
        <p>
          This number isn&apos;t registered as a Jiwambe onboarding agent yet.
          Reach out to our team and we&apos;ll help you get access.
        </p>
      }
      icon={
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[26px] bg-red-bg text-2xl font-extrabold text-red">
          !
        </div>
      }
    >
      <div className="space-y-3 rounded-[20px] border border-line bg-card p-5 text-left text-sm">
        <p>
          <span className="font-semibold text-ink">Phone:</span>{" "}
          <a
            href={`tel:${ONBOARDING_SUPPORT.phoneTel}`}
            className="text-accent-deep underline"
          >
            {ONBOARDING_SUPPORT.phone}
          </a>
        </p>
        <p>
          <span className="font-semibold text-ink">Email:</span>{" "}
          <a
            href={`mailto:${ONBOARDING_SUPPORT.email}`}
            className="text-accent-deep underline"
          >
            {ONBOARDING_SUPPORT.email}
          </a>
        </p>
        <p>
          <span className="font-semibold text-ink">WhatsApp:</span>{" "}
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-deep underline"
          >
            {ONBOARDING_SUPPORT.phone}
          </a>
        </p>
      </div>

      <Link href={AppRoutes.home} className="mt-6 block">
        <ProtoBtn className="w-full">Back to sign in</ProtoBtn>
      </Link>
    </AuthStatusLayout>
  );
}
