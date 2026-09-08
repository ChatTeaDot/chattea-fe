import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
  setItemAsync: vi.fn((key: string, value: string) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: vi.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  }),
}));

describe("auth continuation", () => {
  beforeEach(() => {
    store.clear();
  });

  it("survives a module reload and clears expired data", async () => {
    const continuation = await import("../src/features/auth/utils/continuation");
    const value = {
      kakaoToken: "kakao-token",
      phone: "+821012345678",
      signupToken: "signup-token",
    };

    await continuation.saveAuthContinuation(value, Date.now() + 60_000);
    vi.resetModules();

    const reloaded = await import("../src/features/auth/utils/continuation");
    await expect(reloaded.loadAuthContinuation()).resolves.toEqual(value);

    await reloaded.saveAuthContinuation(value, Date.now() - 1);
    await expect(reloaded.loadAuthContinuation()).resolves.toBeNull();
    expect(store.has("chattea.authContinuation")).toBe(false);
  });

  it("never extends past a token expiry", async () => {
    const { getAuthContinuationExpiresAt } =
      await import("../src/features/auth/utils/continuation");
    const now = 1_800_000_000_000;
    const tokenExpiresAt = now + 60_000;
    const payload = btoa(JSON.stringify({ exp: tokenExpiresAt / 1000 }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const token = `header.${payload}.signature`;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    expect(getAuthContinuationExpiresAt(15 * 60_000, [token])).toBe(tokenExpiresAt);

    nowSpy.mockReturnValue(tokenExpiresAt);
    expect(() => getAuthContinuationExpiresAt(15 * 60_000, [token])).toThrow(
      "AUTH_CONTINUATION_EXPIRED",
    );
    nowSpy.mockRestore();
  });
});
