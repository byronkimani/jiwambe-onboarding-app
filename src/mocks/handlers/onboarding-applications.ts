import { http, HttpResponse } from "msw";
import {
  getSeedApplicationById,
  getSeedApplications,
} from "@/lib/onboarding/fixtures/seed-applications";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

/** Upstream worklist — mirrors future `JIWAMBE_API_BASE_URL` contract (demo fixtures). */
export const onboardingApplicationsHandlers = [
  http.get(upstreamPath("/onboarding/applications"), () => {
    return HttpResponse.json({ applications: getSeedApplications() });
  }),

  http.get(upstreamPath("/onboarding/applications/:id"), ({ params }) => {
    const id = String(params.id);
    const application = getSeedApplicationById(id);
    if (!application) {
      return HttpResponse.json({ error: "notFound" }, { status: 404 });
    }
    return HttpResponse.json({ application });
  }),
];
