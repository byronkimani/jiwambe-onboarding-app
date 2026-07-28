import { SummaryFlowClient } from "@/components/onboarding/flows/summary-flow-client";

type Props = { params: Promise<{ id: string }> };

export default async function DeskApplicationSummaryPage({ params }: Props) {
  const { id } = await params;
  return <SummaryFlowClient id={id} />;
}
