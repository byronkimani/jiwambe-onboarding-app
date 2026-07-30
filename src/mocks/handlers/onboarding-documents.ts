import { http, HttpResponse } from "msw";
import { documentInitRequestSchema } from "@/lib/onboarding/schemas/document-schemas";
import { upstreamPath } from "@/mocks/handlers/upstream-path";
import {
  mockCompleteDocument,
  mockInitDocument,
  mockPutDocument,
} from "@/mocks/documents-mock-state";

export const onboardingDocumentsHandlers = [
  http.post(
    upstreamPath("/onboarding/applications/:id/documents/init"),
    async ({ params, request }) => {
      const id = String(params.id);
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return HttpResponse.json({ error: "invalid_body" }, { status: 400 });
      }

      const parsed = documentInitRequestSchema.safeParse(body);
      if (!parsed.success) {
        return HttpResponse.json({ error: "invalid_body" }, { status: 400 });
      }

      const result = mockInitDocument(id, parsed.data);
      if (!result.ok) {
        return HttpResponse.json({ error: result.error }, { status: result.status });
      }

      return HttpResponse.json({
        documentId: result.documentId,
        uploadUrl: result.uploadUrl,
        uploadHeaders: result.uploadHeaders,
        expiresAt: result.expiresAt,
      });
    },
  ),

  http.put("*/mock/documents/:documentId/upload", async ({ params }) => {
    const documentId = String(params.documentId);
    if (!mockPutDocument(documentId)) {
      return HttpResponse.json({ error: "not_found" }, { status: 404 });
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(
    upstreamPath(
      "/onboarding/applications/:id/documents/:documentId/complete",
    ),
    ({ params }) => {
      const id = String(params.id);
      const documentId = String(params.documentId);
      const result = mockCompleteDocument(id, documentId);
      if (!result.ok) {
        return HttpResponse.json({ error: result.error }, { status: result.status });
      }
      return HttpResponse.json({ application: result.application });
    },
  ),
];
