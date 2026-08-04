import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes, FieldRoutes } from "@/lib/global/shared/routes";
import {
  BffSessionExpiredError,
  bffFetch,
  resetBffSessionRecoveryForTests,
} from "@/lib/global/client/bff-fetch";

const signOutMock = vi.fn();
const captureMessageMock = vi.fn();
const withScopeMock = vi.fn((callback: (scope: { setTag: typeof vi.fn; setLevel: typeof vi.fn }) => void) => {
  callback({
    setTag: vi.fn(),
    setLevel: vi.fn(),
  });
});

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock("@sentry/nextjs", () => ({
  captureMessage: (...args: unknown[]) => captureMessageMock(...args),
  withScope: (callback: (scope: { setTag: typeof vi.fn; setLevel: typeof vi.fn }) => void) =>
    withScopeMock(callback),
}));

describe("bffFetch", () => {
  const fetchMock = vi.fn();
  const assignMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    signOutMock.mockReset();
    captureMessageMock.mockReset();
    withScopeMock.mockClear();
    assignMock.mockReset();
    resetBffSessionRecoveryForTests();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign: assignMock },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns response on success for protected routes", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const response = await bffFetch(FieldRoutes.authMe);

    expect(response.status).toBe(200);
    expect(signOutMock).not.toHaveBeenCalled();
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("does not recover session on 401 for public auth routes", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_credentials" }), { status: 401 }),
    );

    const response = await bffFetch(AppRoutes.apiOnboardingAuthLogin, {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "x" }),
    });

    expect(response.status).toBe(401);
    expect(signOutMock).not.toHaveBeenCalled();
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("signs out and redirects on 401 for protected routes", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    signOutMock.mockResolvedValue(undefined);

    await expect(bffFetch(FieldRoutes.products)).rejects.toBeInstanceOf(
      BffSessionExpiredError,
    );

    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(assignMock).toHaveBeenCalledWith(`${AppRoutes.home}?sessionExpired=1`);
  });

  it("passes through non-401 errors on protected routes", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const response = await bffFetch(FieldRoutes.bikesAssignable);

    expect(response.status).toBe(404);
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("does not recover session for presigned upload URLs", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const response = await bffFetch("https://storage.example.com/upload/doc_1", {
      method: "PUT",
    });

    expect(response.status).toBe(401);
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("reports 5xx BFF responses to Sentry", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    const response = await bffFetch(FieldRoutes.products);

    expect(response.status).toBe(503);
    expect(withScopeMock).toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledWith(
      `BFF 503: ${FieldRoutes.products}`,
    );
  });
});
