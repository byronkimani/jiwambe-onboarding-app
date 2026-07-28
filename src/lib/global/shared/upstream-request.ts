import { getJiwambeApiBaseUrl } from "@/lib/global/shared/env";

export type UpstreamRequestOptions = {
  accessToken?: string;
};

export async function upstreamRequest(
  path: string,
  init?: RequestInit,
  options?: UpstreamRequestOptions,
): Promise<Response> {
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
