import { http, HttpResponse } from "msw";
import {
  findApplicationByIdOrRef,
  listApplicationSummaries,
  mockCreateApplication,
  mockCustomerLookup,
  mockGetCurrentApplication,
  mockPatchApplication,
  mockPauseApplication,
  mockSubmitApplication,
  mockDisqualifyApplication,
} from "@/mocks/applications-mock-state";
import {
  customerLookupRequestSchema,
  normalizeCustomerLookupRequest,
} from "@/lib/onboarding/schemas/application-schemas";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

/** Upstream worklist — mirrors `docs/onboarding-applications-api-contract.md`. */
export const onboardingApplicationsHandlers = [
  http.get(upstreamPath("/onboarding/applications"), ({ request }) => {
    const url = new URL(request.url);
    const lifecycleState = url.searchParams.get("lifecycleState");
    const scope = url.searchParams.get("scope");
    const applications = listApplicationSummaries({ lifecycleState, scope });
    return HttpResponse.json({ applications });
  }),

  http.post(upstreamPath("/onboarding/applications"), async ({ request }) => {
    const body = await request.json();
    const result = mockCreateApplication(body);
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json(
      { application: result.application },
      { status: 201 },
    );
  }),

  http.get(upstreamPath("/onboarding/applications/current"), () => {
    const result = mockGetCurrentApplication();
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({ application: result.application });
  }),

  http.get(upstreamPath("/onboarding/applications/:id"), ({ params }) => {
    const id = String(params.id);
    const application = findApplicationByIdOrRef(id);
    if (!application) {
      return HttpResponse.json({ error: "not_found" }, { status: 404 });
    }
    return HttpResponse.json({ application });
  }),

  http.patch(upstreamPath("/onboarding/applications/:id"), async ({ params, request }) => {
    const id = String(params.id);
    const body = await request.json();
    const result = mockPatchApplication(id, body);
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({ application: result.application });
  }),

  http.post(
    upstreamPath("/onboarding/applications/:id/pause"),
    async ({ params, request }) => {
      const id = String(params.id);
      const body = await request.json();
      const result = mockPauseApplication(id, body);
      if (!result.ok) {
        return HttpResponse.json({ error: result.error }, { status: result.status });
      }
      return HttpResponse.json({ application: result.application });
    },
  ),

  http.post(
    upstreamPath("/onboarding/applications/:id/submit"),
    async ({ params, request }) => {
      const id = String(params.id);
      const body = await request.json();
      const result = mockSubmitApplication(id, body);
      if (!result.ok) {
        return HttpResponse.json(
          result.blockingIssues
            ? { error: result.error, blockingIssues: result.blockingIssues }
            : { error: result.error },
          { status: result.status },
        );
      }
      return HttpResponse.json({ application: result.application });
    },
  ),

  http.post(
    upstreamPath("/onboarding/applications/:id/disqualify"),
    async ({ params, request }) => {
      const id = String(params.id);
      const body = await request.json();
      const result = mockDisqualifyApplication(id, body);
      if (!result.ok) {
        return HttpResponse.json({ error: result.error }, { status: result.status });
      }
      return HttpResponse.json({ application: result.application });
    },
  ),

  http.post(upstreamPath("/onboarding/customers/lookup"), async ({ request }) => {
    const body = await request.json();
    const parsed = customerLookupRequestSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const normalized = normalizeCustomerLookupRequest(parsed.data);
    if (!normalized.ok) {
      return HttpResponse.json(
        { error: "invalid_body", message: normalized.message },
        { status: 400 },
      );
    }
    const result = mockCustomerLookup({
      phone: normalized.phone,
      nationalId: normalized.nationalId,
    });
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({ matches: result.matches });
  }),
];
