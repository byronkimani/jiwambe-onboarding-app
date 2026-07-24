import { ShellPlaceholder } from "@/components/layout/shell-placeholder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeskApplicationAgreementPage({ params }: Props) {
  const { id } = await params;
  return (
    <ShellPlaceholder
      title="Loan agreement"
      description={`Agreement signing for application ${id}.`}
    />
  );
}
