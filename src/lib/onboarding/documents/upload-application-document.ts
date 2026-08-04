import { bffFetch } from "@/lib/global/client/bff-fetch";
import { fieldApplicationDocumentComplete, fieldApplicationDocumentInit } from "@/lib/global/shared/routes";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import {
  resolveCaptureUploadMime,
  validateCaptureUploadFile,
} from "@/lib/onboarding/documents/document-purposes";
import { documentFromPurpose } from "@/lib/onboarding/documents/document-slot-map";
import type {
  OnboardingApplicationResource,
  OnboardingDocument,
} from "@/lib/onboarding/application-resource";
import { parseDocumentInitResponse } from "@/lib/onboarding/schemas/document-schemas";

export type UploadedApplicationDocument = {
  documentId: string;
  url: string;
  status: OnboardingDocument["status"];
  application: OnboardingApplicationResource;
};

export async function uploadApplicationDocument(options: {
  applicationId: string;
  purpose: DocumentPurpose;
  file: File;
}): Promise<UploadedApplicationDocument> {
  const validationError = validateCaptureUploadFile(options.file);
  if (validationError) {
    throw new Error(validationError);
  }

  const contentType = resolveCaptureUploadMime(options.file);

  const initResponse = await bffFetch(
    fieldApplicationDocumentInit(options.applicationId),
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: options.purpose,
        contentType,
        byteSize: options.file.size,
      }),
    },
  );

  if (!initResponse.ok) {
    throw new Error("init_failed");
  }

  const initJson = await initResponse.json();
  const parsedInit = parseDocumentInitResponse(initJson);
  if (!parsedInit.ok) {
    throw new Error("init_invalid");
  }

  const { documentId, uploadUrl, uploadHeaders } = parsedInit.data;
  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      ...(uploadHeaders ?? {}),
      "Content-Type": contentType,
    },
    body: options.file,
  });

  if (!putResponse.ok) {
    throw new Error("upload_failed");
  }

  const completeResponse = await bffFetch(
    fieldApplicationDocumentComplete(options.applicationId, documentId),
    {
      method: "POST",
      credentials: "same-origin",
    },
  );

  if (!completeResponse.ok) {
    throw new Error("complete_failed");
  }

  const completeJson = (await completeResponse.json()) as {
    application?: OnboardingApplicationResource;
  };

  if (!completeJson.application) {
    throw new Error("document_missing");
  }

  const doc = documentFromPurpose(completeJson.application, options.purpose);

  if (!doc?.url) {
    throw new Error("document_missing");
  }

  return {
    documentId: doc.documentId,
    url: doc.url,
    status: doc.status ?? "ready",
    application: completeJson.application,
  };
}
