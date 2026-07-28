import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/lib/global/shared/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="card-shadow w-full max-w-sm rounded-[18px] bg-card px-5 py-8 text-center">
        <h1 className="text-lg font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink-soft">
          The page you are looking for does not exist.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href={AppRoutes.home}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
