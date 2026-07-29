import { DeskApplicationRouter } from "@/components/onboarding/desk/desk-application-router";

type Props = { params: Promise<{ id: string }> };

export default async function DeskApplicationPage({ params }: Props) {
  const { id } = await params;
  return <DeskApplicationRouter id={id} />;
}
