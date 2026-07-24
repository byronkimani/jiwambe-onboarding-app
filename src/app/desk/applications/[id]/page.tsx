import { ShellPlaceholder } from "@/components/layout/shell-placeholder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeskApplicationPage({ params }: Props) {
  const { id } = await params;
  return (
    <ShellPlaceholder
      title={`Application ${id}`}
      description="Application detail shell. Use agreement, release, or summary routes for sub-flows."
    />
  );
}
