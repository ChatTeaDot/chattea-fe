import { describe, expect, it, vi } from "vitest";

import {
  canonicalizeRevenueCatProductId,
  createRevenueCatLifecycle,
  mapRevenueCatPackages,
  type RevenueCatPackage,
  type RevenueCatSdk,
  type RevenueCatState,
  selectRevenueCatKey,
} from "../src/features/native/billing/revenuecat-lifecycle";

const productIds = [
  "chattea_basic_monthly",
  "chattea_gold_monthly",
  "chattea_black_monthly",
  "chattea_boost_30m",
  "chattea_superlikes_5",
] as const;

const initialBackendState = {
  boostCredits: 2,
  planId: "free" as const,
  superLikeCredits: 3,
};

const createPackage = (productIdentifier: string, priceString = "₩9,900"): RevenueCatPackage => ({
  identifier: `package-${productIdentifier}`,
  product: {
    identifier: productIdentifier,
    priceString,
  },
});

const createSdk = (packages: RevenueCatPackage[] = []): RevenueCatSdk => ({
  configure: vi.fn(),
  getAppUserID: vi.fn(() => Promise.resolve("user-1")),
  getOfferings: vi.fn(() => Promise.resolve({ current: { availablePackages: packages } })),
  isConfigured: vi.fn(() => Promise.resolve(false)),
  logIn: vi.fn(() => Promise.resolve()),
  logOut: vi.fn(() => Promise.resolve()),
  purchasePackage: vi.fn(() => Promise.resolve()),
  restorePurchases: vi.fn(() => Promise.resolve({ activeSubscriptions: [] })),
});

const createDeferred = <Value>() => {
  let resolve!: (value: Value) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
};

describe("RevenueCat lifecycle", () => {
  it("selects and trims only the active native platform key", () => {
    const keys = { android: " goog_key ", ios: " appl_key " };

    expect(selectRevenueCatKey("ios", keys)).toBe("appl_key");
    expect(selectRevenueCatKey("android", keys)).toBe("goog_key");
    expect(selectRevenueCatKey("web", keys)).toBeNull();
  });

  it("stays disabled without a platform key and never starts the SDK", async () => {
    const sdk = createSdk();
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: {},
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend: vi.fn(() => Promise.resolve(initialBackendState)),
      sdk,
    });

    await lifecycle.syncUser("user-1");

    expect(states.at(-1)).toEqual({
      message: "이 빌드에는 App Store 결제가 설정되지 않았어요.",
      status: "disabled",
    });
    expect(sdk.isConfigured).not.toHaveBeenCalled();
  });

  it("configures once with the authenticated ChatTea UUID", async () => {
    const sdk = createSdk(productIds.map((id) => createPackage(id)));
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend: vi.fn(() => Promise.resolve(initialBackendState)),
      sdk,
    });

    await lifecycle.syncUser("chattea-user-id");

    expect(sdk.configure).toHaveBeenCalledWith({
      apiKey: "appl_key",
      appUserID: "chattea-user-id",
    });
    expect(states.at(-1)).toMatchObject({ status: "ready", userId: "chattea-user-id" });
  });

  it("logs in a different authenticated UUID before loading offerings", async () => {
    const order: string[] = [];
    const sdk = createSdk();
    vi.mocked(sdk.isConfigured).mockResolvedValue(true);
    vi.mocked(sdk.getAppUserID).mockResolvedValue("old-user");
    vi.mocked(sdk.logIn).mockImplementation(async (userId) => {
      order.push(`login:${userId}`);
    });
    vi.mocked(sdk.getOfferings).mockImplementation(async () => {
      order.push("offerings");
      return { current: { availablePackages: [] } };
    });
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend: vi.fn(() => Promise.resolve(initialBackendState)),
      sdk,
    });

    await lifecycle.syncUser("new-user");

    expect(order).toEqual(["login:new-user", "offerings"]);
  });

  it("does not publish offerings completed for a stale user", async () => {
    const firstOfferings = createDeferred<{
      current: { availablePackages: RevenueCatPackage[] };
    }>();
    const sdk = createSdk([createPackage("chattea_gold_monthly", "₩19,900")]);
    let configured = false;
    let appUserId = "";
    vi.mocked(sdk.isConfigured).mockImplementation(async () => configured);
    vi.mocked(sdk.configure).mockImplementation(({ appUserID }) => {
      configured = true;
      appUserId = appUserID;
    });
    vi.mocked(sdk.getAppUserID).mockImplementation(async () => appUserId);
    vi.mocked(sdk.logIn).mockImplementation(async (userId) => {
      appUserId = userId;
    });
    vi.mocked(sdk.getOfferings)
      .mockImplementationOnce(() => firstOfferings.promise)
      .mockResolvedValueOnce({
        current: { availablePackages: [createPackage("chattea_gold_monthly", "₩19,900")] },
      });
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend: vi.fn(() => Promise.resolve(initialBackendState)),
      sdk,
    });

    const first = lifecycle.syncUser("old-user");
    await vi.waitFor(() => expect(sdk.getOfferings).toHaveBeenCalledTimes(1));
    const second = lifecycle.syncUser("new-user");
    firstOfferings.resolve({
      current: { availablePackages: [createPackage("chattea_basic_monthly", "₩9,900")] },
    });
    await Promise.all([first, second]);

    expect(states).not.toContainEqual(
      expect.objectContaining({ status: "ready", userId: "old-user" }),
    );
    expect(states.at(-1)).toMatchObject({ status: "ready", userId: "new-user" });
  });

  it("serializes an identity change behind a purchase and ignores its stale completion", async () => {
    const purchase = createDeferred<void>();
    const order: string[] = [];
    const sdk = createSdk([createPackage("chattea_basic_monthly")]);
    let appUserId = "user-1";
    vi.mocked(sdk.isConfigured).mockResolvedValue(true);
    vi.mocked(sdk.getAppUserID).mockImplementation(async () => appUserId);
    vi.mocked(sdk.logIn).mockImplementation(async (userId) => {
      appUserId = userId;
      order.push(`login:${userId}`);
    });
    vi.mocked(sdk.purchasePackage).mockImplementation(async () => {
      order.push("purchase:start");
      await purchase.promise;
      order.push("purchase:end");
    });
    const refreshBackend = vi.fn(() =>
      Promise.resolve({ ...initialBackendState, planId: "basic" as const }),
    );
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    const purchaseResult = lifecycle.purchase("chattea_basic_monthly");
    await vi.waitFor(() => expect(order).toEqual(["purchase:start"]));
    const identityChange = lifecycle.syncUser("user-2");
    await Promise.resolve();

    expect(order).toEqual(["purchase:start"]);

    purchase.resolve();
    await expect(purchaseResult).resolves.toBe("stale");
    await identityChange;
    await lifecycle.retryReconciliation();

    expect(order).toEqual(["purchase:start", "purchase:end", "login:user-2"]);
    expect(refreshBackend).not.toHaveBeenCalled();
  });

  it("suppresses a consumable baseline failure from a superseded identity", async () => {
    const baseline = createDeferred<typeof initialBackendState>();
    const sdk = createSdk([createPackage("chattea_boost_30m")]);
    let appUserId = "user-1";
    vi.mocked(sdk.isConfigured).mockResolvedValue(true);
    vi.mocked(sdk.getAppUserID).mockImplementation(async () => appUserId);
    vi.mocked(sdk.logIn).mockImplementation(async (userId) => {
      appUserId = userId;
    });
    const refreshBackend = vi.fn(() => baseline.promise);
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend,
      sdk,
    });
    await lifecycle.syncUser("user-1");

    const purchase = lifecycle.purchase("chattea_boost_30m");
    await vi.waitFor(() => expect(refreshBackend).toHaveBeenCalledOnce());
    const identityChange = lifecycle.syncUser("user-2");
    baseline.reject(new Error("SESSION_CHANGED_DURING_REQUEST"));

    await expect(purchase).resolves.toBe("stale");
    await identityChange;
    expect(sdk.purchasePackage).not.toHaveBeenCalled();
  });

  it("serializes logout behind restore and suppresses the stale restore failure", async () => {
    const restore = createDeferred<{ activeSubscriptions: string[] }>();
    const order: string[] = [];
    const sdk = createSdk();
    vi.mocked(sdk.isConfigured).mockResolvedValue(true);
    vi.mocked(sdk.restorePurchases).mockImplementation(async () => {
      order.push("restore:start");
      try {
        return await restore.promise;
      } finally {
        order.push("restore:end");
      }
    });
    vi.mocked(sdk.logOut).mockImplementation(async () => {
      order.push("logout");
    });
    const refreshBackend = vi.fn(() => Promise.resolve(initialBackendState));
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    const restoreResult = lifecycle.restore();
    await vi.waitFor(() => expect(order).toEqual(["restore:start"]));
    const logout = lifecycle.logOut();
    await Promise.resolve();

    expect(order).toEqual(["restore:start"]);

    restore.reject(new Error("stale restore failure"));
    await expect(restoreResult).resolves.toBe("stale");
    await logout;

    expect(order).toEqual(["restore:start", "restore:end", "logout"]);
    expect(refreshBackend).not.toHaveBeenCalled();
  });

  it("canonicalizes Android base plans and ignores products outside the backend catalog", () => {
    expect(canonicalizeRevenueCatProductId("chattea_gold_monthly:monthly")).toBe(
      "chattea_gold_monthly",
    );

    const mapped = mapRevenueCatPackages([
      createPackage("chattea_gold_monthly:monthly", "₩19,900"),
      createPackage("untrusted_product", "₩1"),
    ]);

    expect(mapped).toEqual({
      chattea_gold_monthly: {
        package: expect.objectContaining({ identifier: "package-chattea_gold_monthly:monthly" }),
        priceString: "₩19,900",
      },
    });
  });

  it("fails closed when an offering has duplicate packages for one backend product", () => {
    const mapped = mapRevenueCatPackages([
      createPackage("chattea_basic_monthly", "₩9,900"),
      createPackage("chattea_basic_monthly:monthly", "₩8,900"),
    ]);

    expect(mapped).toEqual({});
  });

  it("purchases only the exact mapped package and refreshes backend state", async () => {
    const selectedPackage = createPackage("chattea_superlikes_5", "₩4,900");
    const sdk = createSdk([selectedPackage]);
    const refreshed = { ...initialBackendState, superLikeCredits: 8 };
    const refreshBackend = vi
      .fn()
      .mockResolvedValueOnce(initialBackendState)
      .mockResolvedValue(refreshed);
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    const result = await lifecycle.purchase("chattea_superlikes_5");
    await lifecycle.retryReconciliation();

    expect(result).toBe("purchased");
    expect(sdk.purchasePackage).toHaveBeenCalledWith(selectedPackage);
    expect(refreshBackend).toHaveBeenCalledTimes(2);
    await expect(lifecycle.purchase("untrusted_product")).rejects.toThrow(
      "REVENUECAT_PACKAGE_UNAVAILABLE",
    );
  });

  it("uses a fresh server balance instead of a stale higher cache as the purchase baseline", async () => {
    const selectedPackage = createPackage("chattea_boost_30m", "₩4,900");
    const sdk = createSdk([selectedPackage]);
    const staleCache = { ...initialBackendState, boostCredits: 9 };
    const serverBaseline = { ...initialBackendState, boostCredits: 1 };
    const reconciled = { ...initialBackendState, boostCredits: 2 };
    const order: string[] = [];
    vi.mocked(sdk.purchasePackage).mockImplementation(async () => {
      order.push("purchase");
    });
    const refreshBackend = vi
      .fn()
      .mockImplementationOnce(async () => {
        order.push("baseline");
        return serverBaseline;
      })
      .mockImplementationOnce(async () => {
        order.push("reconcile");
        return reconciled;
      });
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => staleCache,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.purchase("chattea_boost_30m")).resolves.toBe("purchased");
    await lifecycle.retryReconciliation();

    expect(order).toEqual(["baseline", "purchase", "reconcile"]);
    expect(states.at(-1)).toMatchObject({ reconciliationPending: false, status: "ready" });
  });

  it("keeps a successful store purchase pending when the first backend refresh fails", async () => {
    const selectedPackage = createPackage("chattea_superlikes_5", "₩4,900");
    const sdk = createSdk([selectedPackage]);
    const baseline = { boostCredits: 2, planId: "free" as const, superLikeCredits: 3 };
    const refreshed = { ...baseline, superLikeCredits: 8 };
    const firstAttempt = createDeferred<void>();
    const refreshBackend = vi
      .fn()
      .mockResolvedValueOnce(baseline)
      .mockRejectedValueOnce(new Error("webhook not visible yet"))
      .mockResolvedValueOnce(refreshed);
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => baseline,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: vi
        .fn()
        .mockImplementationOnce(() => firstAttempt.promise)
        .mockResolvedValue(undefined),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.purchase("chattea_superlikes_5")).resolves.toBe("purchased");
    const firstReconciliation = lifecycle.retryReconciliation();
    firstAttempt.resolve();
    await firstReconciliation;

    expect(states.at(-1)).toMatchObject({ reconciliationPending: true, status: "ready" });
    expect(sdk.purchasePackage).toHaveBeenCalledTimes(1);

    await lifecycle.retryReconciliation();

    expect(states.at(-1)).toMatchObject({ reconciliationPending: false, status: "ready" });
    expect(sdk.purchasePackage).toHaveBeenCalledTimes(1);
  });

  it("does not invite a second purchase while a delayed webhook still returns old state", async () => {
    const selectedPackage = createPackage("chattea_boost_30m", "₩4,900");
    const sdk = createSdk([selectedPackage]);
    const baseline = { boostCredits: 2, planId: "free" as const, superLikeCredits: 3 };
    let refreshed = baseline;
    const refreshBackend = vi.fn(async () => refreshed);
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => baseline,
      reconciliationDelaysMs: [0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.purchase("chattea_boost_30m")).resolves.toBe("purchased");
    await lifecycle.retryReconciliation();

    expect(states.at(-1)).toMatchObject({ reconciliationPending: true, status: "ready" });
    await expect(lifecycle.purchase("chattea_boost_30m")).rejects.toThrow(
      "REVENUECAT_RECONCILIATION_PENDING",
    );

    refreshed = { ...baseline, boostCredits: 3 };
    await lifecycle.retryReconciliation();

    expect(states.at(-1)).toMatchObject({ reconciliationPending: false, status: "ready" });
    expect(sdk.purchasePackage).toHaveBeenCalledTimes(1);
  });

  it("keeps retrying a pending reconciliation and cancels scheduled work on identity change", async () => {
    const sdk = createSdk([createPackage("chattea_boost_30m")]);
    const baseline = { boostCredits: 2, planId: "free" as const, superLikeCredits: 3 };
    let backendState = baseline;
    const refreshBackend = vi.fn(async () => backendState);
    const cancelRetry = vi.fn();
    let scheduledRetry: (() => void) | null = null;
    const scheduleRetry = vi.fn((retry: () => void, _delayMs: number) => {
      scheduledRetry = retry;
      return cancelRetry;
    });
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => baseline,
      reconciliationDelaysMs: [0],
      reconciliationRetryDelayMs: 45_000,
      refreshBackend,
      scheduleRetry,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.purchase("chattea_boost_30m")).resolves.toBe("purchased");
    await vi.waitFor(() => expect(scheduleRetry).toHaveBeenCalledTimes(1));

    expect(scheduleRetry).toHaveBeenCalledWith(expect.any(Function), 45_000);
    expect(refreshBackend).toHaveBeenCalledTimes(2);
    expect(states.at(-1)).toMatchObject({ reconciliationPending: true });

    backendState = { ...baseline, boostCredits: 3 };
    await lifecycle.retryReconciliation();

    expect(cancelRetry).toHaveBeenCalled();
    expect(refreshBackend).toHaveBeenCalledTimes(3);
    expect(states.at(-1)).toMatchObject({ reconciliationPending: false });

    backendState = baseline;
    await expect(lifecycle.purchase("chattea_boost_30m")).resolves.toBe("purchased");
    await vi.waitFor(() => expect(scheduleRetry).toHaveBeenCalledTimes(2));
    expect(refreshBackend).toHaveBeenCalledTimes(5);
    const automaticRetry = scheduledRetry as (() => void) | null;
    expect(automaticRetry).not.toBeNull();
    automaticRetry?.();
    await vi.waitFor(() => expect(refreshBackend).toHaveBeenCalledTimes(6));
    await vi.waitFor(() => expect(scheduleRetry).toHaveBeenCalledTimes(3));
    const staleRetry = scheduledRetry as (() => void) | null;
    const refreshCount = refreshBackend.mock.calls.length;

    await lifecycle.syncUser("user-2");
    staleRetry?.();
    await Promise.resolve();

    expect(cancelRetry).toHaveBeenCalled();
    expect(refreshBackend).toHaveBeenCalledTimes(refreshCount);
  });

  it("treats a user-cancelled purchase as cancellation without starting reconciliation", async () => {
    const sdk = createSdk([createPackage("chattea_boost_30m")]);
    vi.mocked(sdk.purchasePackage).mockRejectedValue({ userCancelled: true });
    const refreshBackend = vi.fn(() => Promise.resolve(initialBackendState));
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: vi.fn(),
      platform: "ios",
      readBackendState: () => initialBackendState,
      refreshBackend,
      sdk,
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.purchase("chattea_boost_30m")).resolves.toBe("cancelled");
    expect(refreshBackend).toHaveBeenCalledTimes(1);
  });

  it("restores only on explicit invocation and refreshes backend state", async () => {
    const sdk = createSdk();
    const refreshBackend = vi.fn(() => Promise.resolve(initialBackendState));
    const lifecycle = createRevenueCatLifecycle({
      keys: { android: "goog_key" },
      onState: vi.fn(),
      platform: "android",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0, 0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    expect(sdk.restorePurchases).not.toHaveBeenCalled();
    await expect(lifecycle.restore()).resolves.toBe("restored");
    await lifecycle.retryReconciliation();

    expect(sdk.restorePurchases).toHaveBeenCalledTimes(1);
    expect(refreshBackend).toHaveBeenCalledTimes(2);
  });

  it("uses the restored active subscription as the reconciliation expectation", async () => {
    const sdk = createSdk();
    vi.mocked(sdk.restorePurchases).mockResolvedValue({
      activeSubscriptions: ["chattea_gold_monthly:monthly"],
    });
    const refreshBackend = vi
      .fn()
      .mockResolvedValueOnce(initialBackendState)
      .mockResolvedValueOnce({ ...initialBackendState, planId: "gold" as const });
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0, 0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.restore()).resolves.toBe("restored");
    await lifecycle.retryReconciliation();

    expect(refreshBackend).toHaveBeenCalledTimes(2);
    expect(states.at(-1)).toMatchObject({ reconciliationPending: false, status: "ready" });
  });

  it("runs the complete bounded verification for a restore with no active subscription", async () => {
    const sdk = createSdk();
    const refreshBackend = vi.fn(() => Promise.resolve(initialBackendState));
    const states: RevenueCatState[] = [];
    const lifecycle = createRevenueCatLifecycle({
      keys: { ios: "appl_key" },
      onState: (state) => states.push(state),
      platform: "ios",
      readBackendState: () => initialBackendState,
      reconciliationDelaysMs: [0, 0, 0],
      refreshBackend,
      sdk,
      wait: () => Promise.resolve(),
    });
    await lifecycle.syncUser("user-1");

    await expect(lifecycle.restore()).resolves.toBe("restored");
    await lifecycle.retryReconciliation();

    expect(refreshBackend).toHaveBeenCalledTimes(3);
    expect(states.at(-1)).toMatchObject({ reconciliationPending: false, status: "ready" });
  });
});
