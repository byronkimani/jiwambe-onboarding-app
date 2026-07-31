import {
  getJiwambeApiBaseUrl,
  isMockJiwambeApiEnabled,
} from "@/lib/global/shared/env";
import {
  createRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/global/observability/request-id";
import { isExpectedUpstreamClientError } from "@/lib/global/observability/upstream-log-level";
import {
  logError,
  logInfo,
  logWarn,
} from "@/lib/global/observability/structured-logger";

export type UpstreamRequestOptions = {
  accessToken?: string;
  requestId?: string;
};

const SLOW_UPSTREAM_MS = 3000;

async function ensureMockUpstreamWhenEnabled(): Promise<void> {
  if (!isMockJiwambeApiEnabled()) {
    return;
  }
  const { ensureJiwambeMsw } = await import("@/mocks/jiwambe-msw-server");
  ensureJiwambeMsw();
}

function logUpstreamCall(options: {
  requestId: string;
  upstreamPath: string;
  method: string;
  status: number;
  durationMs: number;
  error?: string;
}): void {
  const fields = {
    event: "upstream_call",
    requestId: options.requestId,
    upstreamPath: options.upstreamPath,
    method: options.method,
    status: options.status,
    durationMs: options.durationMs,
    ...(options.error ? { error: options.error } : {}),
  };

  if (options.error) {
    logError("upstream_call", fields);
    return;
  }

  if (options.status >= 500) {
    logError("upstream_call", fields);
    return;
  }

  if (isExpectedUpstreamClientError(options.upstreamPath, options.status)) {
    logInfo("upstream_call", fields);
    return;
  }

  if (options.status >= 400 || options.durationMs > SLOW_UPSTREAM_MS) {
    logWarn("upstream_call", fields);
    return;
  }

  logInfo("upstream_call", fields);
}

export async function upstreamRequest(
  path: string,
  init?: RequestInit,
  options?: UpstreamRequestOptions,
): Promise<Response> {
  await ensureMockUpstreamWhenEnabled();
  const base = getJiwambeApiBaseUrl();
  const upstreamPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${upstreamPath}`;
  const method = init?.method ?? "GET";
  const requestId = options?.requestId ?? createRequestId();

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options?.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }
  headers.set(REQUEST_ID_HEADER, requestId);

  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });
    logUpstreamCall({
      requestId,
      upstreamPath,
      method,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (error) {
    logUpstreamCall({
      requestId,
      upstreamPath,
      method,
      status: 0,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "upstream_fetch_failed",
    });
    throw error;
  }
}
