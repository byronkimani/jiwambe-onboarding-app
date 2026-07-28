import { ReleaseFlowClient } from "@/components/onboarding/flows/release-flow-client";

type Props = { params: Promise<{ id: string }> };

export default async function DeskApplicationReleasePage({ params }: Props) {
  const { id } = await params;
  return <ReleaseFlowClient id={id} />;
}
