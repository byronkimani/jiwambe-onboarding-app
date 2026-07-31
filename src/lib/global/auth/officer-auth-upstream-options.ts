import { ensureRequestId } from "@/lib/global/observability/request-id";
import type { UpstreamRequestOptions } from "@/lib/global/shared/upstream-request";

export function officerAuthUpstreamOptions(
  request?: Request,
  extra?: UpstreamRequestOptions,
): UpstreamRequestOptions | undefined {
  const requestId = request ? ensureRequestId(request.headers) : undefined;
  if (!requestId && !extra) {
    return undefined;
  }
  return {
    ...extra,
    ...(requestId ? { requestId } : {}),
  };
}
