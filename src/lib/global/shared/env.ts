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

export function getJiwambeApiBaseUrl(): string {
  const { JIWAMBE_API_BASE_URL } = getServerEnv();
  if (!JIWAMBE_API_BASE_URL) {
    throw new Error("JIWAMBE_API_BASE_URL is not configured");
  }
  return JIWAMBE_API_BASE_URL.replace(/\/$/, "");
}
