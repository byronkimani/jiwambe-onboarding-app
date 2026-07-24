import { ShellPlaceholder } from "@/components/layout/shell-placeholder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeskApplicationReleasePage({ params }: Props) {
  const { id } = await params;
  return (
    <ShellPlaceholder
      title="Bike handover"
      description={`Release and customer OTP for application ${id}.`}
    />
  );
}
