import { ensureRequestId } from "@/lib/global/observability/request-id";
import { logInfo } from "@/lib/global/observability/structured-logger";

export function logBffRequest(options: {
  request: Request;
  status: number;
  durationMs: number;
  route: string;
}): void {
  const requestId = ensureRequestId(options.request.headers);
  logInfo("bff_request", {
    event: "bff_request",
    requestId,
    route: options.route,
    method: options.request.method,
    status: options.status,
    durationMs: options.durationMs,
  });
}
