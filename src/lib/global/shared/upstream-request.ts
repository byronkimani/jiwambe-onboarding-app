import {
  getJiwambeApiBaseUrl,
  isMockJiwambeApiEnabled,
} from "@/lib/global/shared/env";

export type UpstreamRequestOptions = {
  accessToken?: string;
};

async function ensureMockUpstreamWhenEnabled(): Promise<void> {
  if (!isMockJiwambeApiEnabled()) {
    return;
  }
  const { ensureJiwambeMsw } = await import("@/mocks/jiwambe-msw-server");
  ensureJiwambeMsw();
}

export async function upstreamRequest(
  path: string,
  init?: RequestInit,
  options?: UpstreamRequestOptions,
): Promise<Response> {
  await ensureMockUpstreamWhenEnabled();
  const base = getJiwambeApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options?.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }
  return fetch(url, {
    ...init,
    headers,
  });
}
