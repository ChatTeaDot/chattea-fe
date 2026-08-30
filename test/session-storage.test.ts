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
    vi.clearAllMocks();
  });

  it("persists and clears sessions", async () => {
    const { loadStoredSession, saveStoredSession } =
      await import("../src/providers/session-storage");

    await saveStoredSession({
      accessToken: "header.payload.signature",
      refreshToken: "refresh.payload.signature",
    });
    await expect(loadStoredSession()).resolves.toEqual({
      accessToken: "header.payload.signature",
      refreshToken: "refresh.payload.signature",
    });

    await saveStoredSession(null);
    await expect(loadStoredSession()).resolves.toBeNull();
  });

  it("serializes overlapping session writes so the newest pair remains durable", async () => {
    const secureStore = await import("expo-secure-store");
    const { loadStoredSession, saveStoredSession } =
      await import("../src/providers/session-storage");
    let releaseFirstWrite!: () => void;
    const firstWritePending = new Promise<void>((resolve) => {
      releaseFirstWrite = resolve;
    });
    vi.mocked(secureStore.setItemAsync).mockImplementationOnce(async (key, value) => {
      await firstWritePending;
      store.set(key, value);
    });

    const firstWrite = saveStoredSession({
      accessToken: "first.payload.signature",
      refreshToken: "first-refresh.payload.signature",
    });
    const secondWrite = saveStoredSession({
      accessToken: "second.payload.signature",
      refreshToken: "second-refresh.payload.signature",
    });
    await vi.waitFor(() => expect(secureStore.setItemAsync).toHaveBeenCalledTimes(1));

    releaseFirstWrite();
    await Promise.all([firstWrite, secondWrite]);

    expect(secureStore.setItemAsync).toHaveBeenCalledTimes(2);
    await expect(loadStoredSession()).resolves.toEqual({
      accessToken: "second.payload.signature",
      refreshToken: "second-refresh.payload.signature",
    });
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
    expect(getSessionRedirect(true, true)).toBeNull();
  });
});
