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

describe("session storage", () => {
  beforeEach(() => {
    store.clear();
  });

  it("persists and clears sessions", async () => {
    const { loadStoredSession, saveStoredSession } =
      await import("../src/providers/session-storage");

    await saveStoredSession({ token: "token", userId: "user" });
    await expect(loadStoredSession()).resolves.toEqual({ token: "token", userId: "user" });

    await saveStoredSession(null);
    await expect(loadStoredSession()).resolves.toBeNull();
  });

  it("drops corrupt stored sessions", async () => {
    const { loadStoredSession } = await import("../src/providers/session-storage");

    store.set("chattea.session", "{");

    await expect(loadStoredSession()).resolves.toBeNull();
    expect(store.has("chattea.session")).toBe(false);
  });

  it("holds redirect until session hydration finishes", async () => {
    const { getSessionRedirect } = await import("../src/providers/session-routing");

    expect(getSessionRedirect(false, false)).toBeNull();
    expect(getSessionRedirect(true, false)).toBe("/phone");
    expect(getSessionRedirect(true, true)).toBe("/matches");
  });
});
