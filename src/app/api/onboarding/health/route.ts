import { NextResponse } from "next/server";
import { runHealthChecks } from "@/lib/global/observability/health-checks";
import { logBffRequest } from "@/lib/global/observability/log-bff-request";
import { AppRoutes } from "@/lib/global/shared/routes";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const report = await runHealthChecks();
  const status = report.ok ? 200 : 503;

  logBffRequest({
    request,
    status,
    durationMs: Date.now() - startedAt,
    route: AppRoutes.apiOnboardingHealth,
  });

  return NextResponse.json(report, { status });
}
