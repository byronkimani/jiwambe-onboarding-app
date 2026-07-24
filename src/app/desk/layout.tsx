import Link from "next/link";
import { AppRoutes } from "@/lib/global/shared/routes";

export default function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-line bg-card px-4 py-3">
        <span className="text-sm font-extrabold tracking-wide text-accent-deep">
          JIWAMBE
        </span>
        <nav className="flex gap-2 text-xs font-bold text-ink-soft">
          <Link className="hover:text-accent-deep" href={AppRoutes.desk}>
            Queue
          </Link>
          <Link className="hover:text-accent-deep" href={AppRoutes.deskHistory}>
            History
          </Link>
          <Link className="hover:text-accent-deep" href={AppRoutes.deskDrafts}>
            Drafts
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
