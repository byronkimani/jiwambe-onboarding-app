import { NextResponse } from "next/server";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";
import { mockPutDocument } from "@/mocks/documents-mock-state";

type Params = { params: Promise<{ documentId: string }> };

/** Mock object-storage PUT for MSW presigned uploads (browser same-origin). */
export async function PUT(request: Request, { params }: Params) {
  if (!isMockJiwambeApiEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { documentId } = await params;
  await request.arrayBuffer();

  if (!mockPutDocument(documentId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 200 });
}
