import { notFound, redirect } from "next/navigation";
import { primaryActionForState } from "@/lib/onboarding/application-helpers";
import { getSeedApplicationById } from "@/lib/onboarding/fixtures/seed-applications";
import {
  captureStage,
  deskApplicationAgreement,
  deskApplicationRelease,
  deskApplicationSummary,
} from "@/lib/global/shared/routes";

type Props = { params: Promise<{ id: string }> };

export default async function DeskApplicationPage({ params }: Props) {
  const { id } = await params;
  const application = getSeedApplicationById(id);
  if (!application) {
    notFound();
  }

  const action = primaryActionForState(application.state);
  if (action === "agreement") {
    redirect(deskApplicationAgreement(id));
  }
  if (action === "release") {
    redirect(deskApplicationRelease(id));
  }
  if (action === "resume") {
    redirect(captureStage("identity"));
  }

  redirect(deskApplicationSummary(id));
}
