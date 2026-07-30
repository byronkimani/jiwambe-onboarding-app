import { describe, expect, it } from "vitest";
import {
  createEmptyIdentityUploadState,
  isIdentityUploadBlocking,
} from "@/lib/onboarding/capture/identity-upload-state";

describe("identity-upload-state", () => {
  it("blocks while uploading or failed", () => {
    const state = createEmptyIdentityUploadState();
    expect(isIdentityUploadBlocking(state)).toBe(false);

    state.id_front.status = "uploading";
    expect(isIdentityUploadBlocking(state)).toBe(true);

    state.id_front.status = "failed";
    expect(isIdentityUploadBlocking(state)).toBe(true);

    state.id_front.status = "uploaded";
    expect(isIdentityUploadBlocking(state)).toBe(false);
  });
});
