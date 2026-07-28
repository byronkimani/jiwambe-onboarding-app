import { getJiwambeApiBaseUrl } from "@/lib/global/shared/env";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";

async function ensureMockUpstream(): Promise<void> {
  if (process.env.MOCK_JIWAMBE_API !== "1") {
    return;
  }
  const { ensureJiwambeMsw } = await import("@/mocks/jiwambe-msw-server");
  ensureJiwambeMsw();
}

export type AgentLoginResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      agent: {
        id: string;
        name: string;
        role: string;
        dealership: string;
      };
    }
  | { ok: false; status: number; error?: string };

export async function loginAgentUpstream(
  phoneRaw: string,
  password: string,
): Promise<AgentLoginResult> {
  await ensureMockUpstream();

  const parsed = parseKenyaPhoneForSubmit(phoneRaw);
  if (!parsed.ok) {
    return { ok: false, status: 400, error: "invalidPhone" };
  }

  const baseUrl = getJiwambeApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/onboarding/agents/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: parsed.wire, password }),
    });
  } catch {
    return { ok: false, status: 0, error: "network" };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    return { ok: false, status: response.status, error: body.error };
  }

  const body = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    agent: AgentLoginResult extends { ok: true } ? AgentLoginResult["agent"] : never;
  };

  return {
    ok: true,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn,
    agent: body.agent,
  };
}

export async function fetchAgentMeUpstream(accessToken: string): Promise<
  | {
      ok: true;
      data: {
        id: string;
        name: string;
        role: string;
        dealership: string;
        phone: string;
      };
    }
  | { ok: false; status: number }
> {
  await ensureMockUpstream();
  const baseUrl = getJiwambeApiBaseUrl();
  const response = await fetch(`${baseUrl}/onboarding/agents/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    return { ok: false, status: response.status };
  }
  const data = (await response.json()) as {
    id: string;
    name: string;
    role: string;
    dealership: string;
    phone: string;
  };
  return { ok: true, data };
}
