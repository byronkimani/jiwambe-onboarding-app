import Link from "next/link";
import { notFound } from "next/navigation";
import { ShellPlaceholder } from "@/components/layout/shell-placeholder";
import {
  AppRoutes,
  CAPTURE_STAGE_KEYS,
  isCaptureStageKey,
} from "@/lib/global/shared/routes";

type Props = {
  params: Promise<{ stage: string }>;
};

export function generateStaticParams() {
  return CAPTURE_STAGE_KEYS.map((stage) => ({ stage }));
}

export default async function CaptureStagePage({ params }: Props) {
  const { stage } = await params;
  if (!isCaptureStageKey(stage)) {
    notFound();
  }

  const label = stage.charAt(0).toUpperCase() + stage.slice(1);

  return (
    <ShellPlaceholder
      title={`Capture — ${label}`}
      description="Multi-stage in-person application capture. See docs/prototype capture slice."
    >
      <Link
        className="mt-6 text-sm font-bold text-accent-deep underline"
        href={AppRoutes.desk}
      >
        Back to desk
      </Link>
    </ShellPlaceholder>
  );
}
