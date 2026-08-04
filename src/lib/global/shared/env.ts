import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  JIWAMBE_API_BASE_URL: z.string().url().optional(),
  MOCK_JIWAMBE_API: z.enum(["0", "1"]).optional(),
  E2E: z.enum(["0", "1"]).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

export function isMockJiwambeApiEnabled(): boolean {
  return process.env.MOCK_JIWAMBE_API === "1";
}

export function isE2eMode(): boolean {
  return process.env.E2E === "1";
}

/** Matches `.env.local.example` and CI; MSW handlers match any host under `/v1`. */
export const DEFAULT_MOCK_JIWAMBE_API_BASE_URL = "http://127.0.0.1:18080";

export function getJiwambeApiBaseUrl(): string {
  const { JIWAMBE_API_BASE_URL } = getServerEnv();
  const resolved =
    JIWAMBE_API_BASE_URL ??
    (isMockJiwambeApiEnabled() ? DEFAULT_MOCK_JIWAMBE_API_BASE_URL : undefined);
  if (!resolved) {
    throw new Error("JIWAMBE_API_BASE_URL is not configured");
  }
  return resolved.replace(/\/$/, "");
}
