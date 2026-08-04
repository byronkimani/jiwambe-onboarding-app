import { logBffRequest } from "@/lib/global/observability/log-bff-request";
import {
  ensureRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/global/observability/request-id";

export function withRequestIdResponse(
  response: Response,
  requestId: string,
): Response {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Echoes X-Request-ID on the response and logs bff_request. */
export async function finalizeBffResponse(options: {
  request: Request;
  route: string;
  startedAt: number;
  response: Response;
}): Promise<Response> {
  const requestId = ensureRequestId(options.request.headers);
  const finalResponse = withRequestIdResponse(options.response, requestId);
  logBffRequest({
    request: options.request,
    status: finalResponse.status,
    durationMs: Date.now() - options.startedAt,
    route: options.route,
  });
  return finalResponse;
}

export function resolveBffRequestId(request: Request): string {
  return ensureRequestId(request.headers);
}

/** Wrap a BFF route handler with bff_request logging and X-Request-ID echo. */
export async function runBffRoute(
  request: Request,
  route: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  const startedAt = Date.now();
  const response = await handler();
  return finalizeBffResponse({ request, route, startedAt, response });
}
