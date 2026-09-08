import { describe, expect, it, vi } from "vitest";

import {
  performForcedSessionTermination,
  performInstallationLogout,
} from "../src/providers/utils/session-actions";

describe("native installation logout", () => {
  it("unregisters the installation before clearing the session and Apollo cache", async () => {
    const order: string[] = [];

    await performInstallationLogout({
      clearCache: async () => {
        order.push("cache");
      },
      clearSession: async () => {
        order.push("session");
      },
      logOutRevenueCat: async () => {
        order.push("revenuecat");
      },
      revokeSession: async () => {
        order.push("revoke");
      },
      unregisterPush: async () => {
        order.push("push");
      },
    });

    expect(order).toEqual(["push", "revoke", "revenuecat", "session", "cache"]);
  });

  it("retains the session and cache when installation unregister fails", async () => {
    const clearSession = vi.fn();
    const clearCache = vi.fn();
    const logOutRevenueCat = vi.fn();

    await expect(
      performInstallationLogout({
        clearCache,
        clearSession,
        logOutRevenueCat,
        revokeSession: vi.fn(),
        unregisterPush: async () => {
          throw new Error("offline");
        },
      }),
    ).rejects.toThrow("offline");

    expect(logOutRevenueCat).not.toHaveBeenCalled();
    expect(clearSession).not.toHaveBeenCalled();
    expect(clearCache).not.toHaveBeenCalled();
  });

  it("finishes local logout after push cleanup when backend revocation fails", async () => {
    const clearSession = vi.fn();
    const clearCache = vi.fn();
    const logOutRevenueCat = vi.fn();

    await expect(
      performInstallationLogout({
        clearCache,
        clearSession,
        logOutRevenueCat,
        revokeSession: async () => {
          throw new Error("revoke failed");
        },
        unregisterPush: vi.fn(async () => undefined),
      }),
    ).rejects.toThrow("revoke failed");

    expect(logOutRevenueCat).toHaveBeenCalledOnce();
    expect(clearSession).toHaveBeenCalledOnce();
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it("finishes local logout when RevenueCat identity cleanup fails", async () => {
    const clearSession = vi.fn();
    const clearCache = vi.fn();

    await expect(
      performInstallationLogout({
        clearCache,
        clearSession,
        logOutRevenueCat: async () => {
          throw new Error("RevenueCat unavailable");
        },
        revokeSession: vi.fn(async () => true),
        unregisterPush: vi.fn(async () => undefined),
      }),
    ).rejects.toThrow("RevenueCat unavailable");

    expect(clearSession).toHaveBeenCalledOnce();
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it("finishes local termination in order when remote push cleanup is unavailable", async () => {
    const order: string[] = [];
    const pushError = new Error("offline");

    await expect(
      performForcedSessionTermination({
        clearCache: async () => {
          order.push("cache");
        },
        clearSession: async () => {
          order.push("session");
        },
        logOutRevenueCat: async () => {
          order.push("revenuecat");
        },
        unregisterPush: async () => {
          order.push("push");
          throw pushError;
        },
      }),
    ).resolves.toEqual([pushError]);

    expect(order).toEqual(["push", "revenuecat", "session", "cache"]);
  });
});
