/** Document refs safe for PATCH — server id and non-blob URL only. */
export function patchDocumentField(
  documentId: string | null,
  url: string | null,
): { documentId: string; url: string; status: "ready" } | null {
  if (!documentId || !url || url.startsWith("blob:")) {
    return null;
  }
  return { documentId, url, status: "ready" };
}
