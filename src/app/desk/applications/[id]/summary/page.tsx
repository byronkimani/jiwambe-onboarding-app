import { ShellPlaceholder } from "@/components/layout/shell-placeholder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeskApplicationSummaryPage({ params }: Props) {
  const { id } = await params;
  return (
    <ShellPlaceholder
      title="Application summary"
      description={`Read-only summary for application ${id}.`}
    />
  );
}
