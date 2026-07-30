import { z } from "zod";
import { DOCUMENT_PURPOSES } from "@/lib/onboarding/documents/document-purposes";

export const documentInitRequestSchema = z.object({
  purpose: z.enum(DOCUMENT_PURPOSES),
  contentType: z.string().min(1),
  byteSize: z.number().int().positive(),
});

export const documentInitResponseSchema = z.object({
  documentId: z.string().min(1),
  uploadUrl: z.string().min(1),
  uploadHeaders: z.record(z.string(), z.string()).optional(),
  expiresAt: z.string().min(1),
});

export type DocumentInitRequest = z.infer<typeof documentInitRequestSchema>;
export type DocumentInitResponse = z.infer<typeof documentInitResponseSchema>;

export function parseDocumentInitResponse(
  json: unknown,
): { ok: true; data: DocumentInitResponse } | { ok: false } {
  const parsed = documentInitResponseSchema.safeParse(json);
  if (!parsed.success) return { ok: false };
  return { ok: true, data: parsed.data };
}
