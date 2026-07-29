import { NextResponse } from "next/server";
import {
  parseApplicationListResponse,
  parseApplicationResource,
  parseCustomerLookupResponse,
  parseInventoryListResponse,
  parseCatalogProductsResponse,
  parseDepositStkResponse,
  parseDepositValidateResponse,
} from "@/lib/onboarding/schemas/parse-onboarding-json";

export function invalidUpstreamResponse(): NextResponse {
  return NextResponse.json({ error: "invalid_upstream" }, { status: 502 });
}

export async function jsonFromUpstream(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function parseUpstreamApplicationResponse(
  response: Response,
): Promise<
  | { ok: true; application: import("@/lib/onboarding/application-resource").OnboardingApplicationResource }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseApplicationResource(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, application: parsed.data };
}

export async function parseUpstreamListResponse(
  response: Response,
): Promise<
  | {
      ok: true;
      applications: import("@/lib/onboarding/application-resource").OnboardingApplicationSummary[];
    }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseApplicationListResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, applications: parsed.data.applications };
}

export async function parseUpstreamLookupResponse(
  response: Response,
): Promise<
  | {
      ok: true;
      matches: import("@/lib/onboarding/application-resource").CustomerLookupMatch[];
    }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseCustomerLookupResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, matches: parsed.data.matches };
}

export async function parseUpstreamInventoryResponse(
  response: Response,
): Promise<
  | {
      ok: true;
      items: import("@/lib/onboarding/schemas/inventory-schemas").InventoryItem[];
      rules: import("@/lib/onboarding/schemas/inventory-schemas").InventoryRules;
    }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseInventoryListResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return {
    ok: true,
    items: parsed.data.items,
    rules: parsed.data.rules,
  };
}

export async function parseUpstreamCatalogProductsResponse(
  response: Response,
): Promise<
  | {
      ok: true;
      products: import("@/lib/onboarding/schemas/catalog-schemas").CatalogProduct[];
    }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseCatalogProductsResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, products: parsed.data.products };
}

export async function parseUpstreamDepositStkResponse(
  response: Response,
): Promise<
  | { ok: true; body: import("@/lib/onboarding/schemas/deposit-schemas").DepositStkResponse }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseDepositStkResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, body: parsed.data };
}

export async function parseUpstreamDepositValidateResponse(
  response: Response,
): Promise<
  | {
      ok: true;
      body: import("@/lib/onboarding/schemas/deposit-schemas").DepositValidateResponse;
    }
  | { ok: false; response: NextResponse }
> {
  const json = await jsonFromUpstream(response);
  if (!response.ok) {
    return {
      ok: false,
      response: NextResponse.json(json ?? { error: "upstream_error" }, {
        status: response.status,
      }),
    };
  }
  const parsed = parseDepositValidateResponse(json);
  if (!parsed.ok) {
    return { ok: false, response: invalidUpstreamResponse() };
  }
  return { ok: true, body: parsed.data };
}
