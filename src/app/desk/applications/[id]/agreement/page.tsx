import { AgreementFlowClient } from "@/components/onboarding/flows/agreement-flow-client";

type Props = { params: Promise<{ id: string }> };

export default async function DeskApplicationAgreementPage({ params }: Props) {
  const { id } = await params;
  return <AgreementFlowClient id={id} />;
}
