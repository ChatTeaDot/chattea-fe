import {
  BILLING_PRODUCT_IDS,
  DEFAULT_RECONCILIATION_DELAYS_MS,
  SUBSCRIPTION_PRODUCT_IDS,
} from "../constants";
import type {
  BackendBillingState,
  ReconciliationRequest,
  RevenueCatCustomerInfo,
  RevenueCatKeys,
  RevenueCatLifecycleInput,
  RevenueCatPackage,
  RevenueCatPackageMap,
  RevenueCatPlatform,
  RevenueCatState,
} from "../types";

export const selectRevenueCatKey = (
  platform: RevenueCatPlatform,
  keys: RevenueCatKeys,
): string | null => {
  const key = platform === "ios" ? keys.ios : platform === "android" ? keys.android : undefined;
  return key?.trim() || null;
};

export const canonicalizeRevenueCatProductId = (productId: string): string => {
  const separator = productId.indexOf(":");
  return separator < 0 ? productId : productId.slice(0, separator);
};

export const mapRevenueCatPackages = (packages: RevenueCatPackage[]): RevenueCatPackageMap => {
  const candidates = new Map<string, RevenueCatPackage[]>();
  for (const selectedPackage of packages) {
    const productId = canonicalizeRevenueCatProductId(selectedPackage.product.identifier);
    if (!BILLING_PRODUCT_IDS.has(productId)) continue;
    const matches = candidates.get(productId) ?? [];
    matches.push(selectedPackage);
    candidates.set(productId, matches);
  }

  const mapped: RevenueCatPackageMap = {};
  for (const [productId, matches] of candidates) {
    if (matches.length !== 1) continue;
    const selectedPackage = matches[0];
    if (!selectedPackage) continue;
    mapped[productId] = {
      package: selectedPackage,
      priceString: selectedPackage.product.priceString,
    };
  }
  return mapped;
};

const isPurchaseCancelled = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "userCancelled" in error &&
  error.userCancelled === true;

const isPurchaseReconciled = (
  request: ReconciliationRequest,
  backendState: BackendBillingState | null,
): boolean => {
  if (!backendState) return false;
  if (!request.productId) return false;
  if (request.productId === "chattea_basic_monthly") return backendState.planId === "basic";
  if (request.productId === "chattea_gold_monthly") return backendState.planId === "gold";
  if (request.productId === "chattea_black_monthly") return backendState.planId === "black";
  if (!request.baseline) return false;
  if (request.productId === "chattea_boost_30m") {
    return backendState.boostCredits >= request.baseline.boostCredits + 1;
  }
  if (request.productId === "chattea_superlikes_5") {
    return backendState.superLikeCredits >= request.baseline.superLikeCredits + 5;
  }
  return false;
};

const getRestoreExpectation = (
  customerInfo: RevenueCatCustomerInfo,
): Pick<ReconciliationRequest, "productId" | "restoreExpectation"> => {
  if (customerInfo.activeSubscriptions.length === 0) {
    return { productId: null, restoreExpectation: "no-active" };
  }
  const productIds = new Set(customerInfo.activeSubscriptions.map(canonicalizeRevenueCatProductId));
  if (productIds.size === 1) {
    const productId = [...productIds][0];
    if (productId && SUBSCRIPTION_PRODUCT_IDS.has(productId)) {
      return { productId, restoreExpectation: null };
    }
  }
  return { productId: null, restoreExpectation: "unknown" };
};

const waitForDelay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const scheduleRetryTask = (retry: () => void, delayMs: number): (() => void) => {
  const timer = setTimeout(retry, delayMs);
  return () => clearTimeout(timer);
};

export const createRevenueCatLifecycle = (input: RevenueCatLifecycleInput) => {
  let activeUserId: string | null = null;
  let generation = 0;
  let operationQueue: Promise<unknown> = Promise.resolve();
  let reconciliationRequest: ReconciliationRequest | null = null;
  let reconciliationTask: Promise<void> | null = null;
  let cancelReconciliationRetry: (() => void) | null = null;
  let state: RevenueCatState = {
    message: "로그인 후 결제 정보를 확인할 수 있어요.",
    status: "disabled",
  };

  const emit = (nextState: RevenueCatState) => {
    state = nextState;
    input.onState(nextState);
  };

  const enqueue = <Value>(operation: () => Promise<Value>): Promise<Value> => {
    const result = operationQueue.catch(() => undefined).then(operation);
    operationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };

  const invalidateReconciliation = () => {
    cancelReconciliationRetry?.();
    cancelReconciliationRetry = null;
    reconciliationRequest = null;
    reconciliationTask = null;
  };

  const emitReconciliationPending = (pending: boolean) => {
    if (state.status !== "ready") return;
    emit({ ...state, reconciliationPending: pending });
  };

  const retryReconciliation = (): Promise<void> => {
    if (reconciliationTask) return reconciliationTask;
    cancelReconciliationRetry?.();
    cancelReconciliationRetry = null;
    const request = reconciliationRequest;
    if (!request) return Promise.resolve();
    const task = (async () => {
      const delays = input.reconciliationDelaysMs ?? DEFAULT_RECONCILIATION_DELAYS_MS;
      const wait = input.wait ?? waitForDelay;
      let finalBackendState: BackendBillingState | null = null;
      for (const delayMs of delays) {
        await wait(delayMs);
        if (
          request !== reconciliationRequest ||
          request.generation !== generation ||
          request.userId !== activeUserId
        ) {
          return;
        }
        try {
          const backendState = await input.refreshBackend();
          finalBackendState = backendState;
          if (
            request !== reconciliationRequest ||
            request.generation !== generation ||
            request.userId !== activeUserId
          ) {
            return;
          }
          if (isPurchaseReconciled(request, backendState)) {
            reconciliationRequest = null;
            emitReconciliationPending(false);
            return;
          }
        } catch {
          if (request.generation !== generation || request.userId !== activeUserId) return;
        }
      }
      if (
        request === reconciliationRequest &&
        request.generation === generation &&
        request.userId === activeUserId &&
        request.restoreExpectation === "no-active" &&
        finalBackendState?.planId === "free"
      ) {
        reconciliationRequest = null;
        emitReconciliationPending(false);
      }
    })().finally(() => {
      if (reconciliationTask === task) reconciliationTask = null;
      if (
        request === reconciliationRequest &&
        request.generation === generation &&
        request.userId === activeUserId &&
        !cancelReconciliationRetry
      ) {
        const scheduleRetry = input.scheduleRetry ?? scheduleRetryTask;
        cancelReconciliationRetry = scheduleRetry(() => {
          cancelReconciliationRetry = null;
          void retryReconciliation();
        }, input.reconciliationRetryDelayMs ?? 30_000);
      }
    });
    reconciliationTask = task;
    return task;
  };

  const beginReconciliation = (
    productId: string | null,
    baseline: BackendBillingState | null = input.readBackendState(),
    restoreExpectation: ReconciliationRequest["restoreExpectation"] = null,
  ) => {
    if (!activeUserId || state.status !== "ready") return;
    reconciliationRequest = {
      baseline,
      generation,
      productId,
      restoreExpectation,
      userId: activeUserId,
    };
    emitReconciliationPending(true);
    void retryReconciliation();
  };

  const syncUser = (userId: string | null): Promise<void> => {
    const requestGeneration = ++generation;
    invalidateReconciliation();
    activeUserId = null;
    if (!userId) {
      emit({
        message: "로그인 후 결제 정보를 확인할 수 있어요.",
        status: "disabled",
      });
      return Promise.resolve();
    }

    emit({ status: "loading" });
    return enqueue(async () => {
      const apiKey = selectRevenueCatKey(input.platform, input.keys);
      if (!apiKey) {
        if (requestGeneration === generation) {
          emit({
            message: "이 빌드에는 App Store 결제가 설정되지 않았어요.",
            status: "disabled",
          });
        }
        return;
      }

      try {
        const configured = await input.sdk.isConfigured();
        if (requestGeneration !== generation) return;
        if (configured) {
          const currentUserId = await input.sdk.getAppUserID();
          if (requestGeneration !== generation) return;
          if (currentUserId !== userId) await input.sdk.logIn(userId);
        } else {
          input.sdk.configure({ apiKey, appUserID: userId });
        }
        if (requestGeneration !== generation) return;

        const offerings = await input.sdk.getOfferings();
        if (requestGeneration !== generation) return;
        activeUserId = userId;
        emit({
          packages: mapRevenueCatPackages(offerings.current?.availablePackages ?? []),
          reconciliationPending: false,
          status: "ready",
          userId,
        });
      } catch {
        if (requestGeneration === generation) {
          activeUserId = null;
          emit({
            message: "스토어 결제 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
            status: "error",
          });
        }
      }
    });
  };

  const purchase = (productId: string): Promise<"cancelled" | "purchased" | "stale"> => {
    if (state.status !== "ready" || !activeUserId) {
      return Promise.reject(new Error("REVENUECAT_NOT_READY"));
    }
    if (state.reconciliationPending) {
      return Promise.reject(new Error("REVENUECAT_RECONCILIATION_PENDING"));
    }
    const selectedPackage = state.packages[productId]?.package;
    if (!selectedPackage) return Promise.reject(new Error("REVENUECAT_PACKAGE_UNAVAILABLE"));
    const requestGeneration = generation;
    const requestUserId = activeUserId;
    return enqueue(async () => {
      if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
      let baseline = input.readBackendState();
      if (!SUBSCRIPTION_PRODUCT_IDS.has(productId)) {
        try {
          baseline = await input.refreshBackend();
        } catch (error) {
          if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
          throw error;
        }
        if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
        if (!baseline) throw new Error("REVENUECAT_BACKEND_STATE_UNAVAILABLE");
      }
      try {
        await input.sdk.purchasePackage(selectedPackage);
      } catch (error) {
        if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
        if (isPurchaseCancelled(error)) return "cancelled";
        throw error;
      }
      if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
      beginReconciliation(productId, baseline);
      return "purchased";
    });
  };

  const restore = (): Promise<"restored" | "stale"> => {
    if (!activeUserId) return Promise.reject(new Error("REVENUECAT_NOT_READY"));
    if (state.status === "ready" && state.reconciliationPending) {
      return Promise.reject(new Error("REVENUECAT_RECONCILIATION_PENDING"));
    }
    const requestGeneration = generation;
    const requestUserId = activeUserId;
    return enqueue(async () => {
      if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
      try {
        const customerInfo = await input.sdk.restorePurchases();
        if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
        const expectation = getRestoreExpectation(customerInfo);
        beginReconciliation(
          expectation.productId,
          input.readBackendState(),
          expectation.restoreExpectation,
        );
      } catch (error) {
        if (requestGeneration !== generation || requestUserId !== activeUserId) return "stale";
        throw error;
      }
      return "restored";
    });
  };

  const logOut = (): Promise<void> => {
    ++generation;
    invalidateReconciliation();
    activeUserId = null;
    emit({
      message: "로그인 후 결제 정보를 확인할 수 있어요.",
      status: "disabled",
    });
    return enqueue(async () => {
      if (await input.sdk.isConfigured()) await input.sdk.logOut();
    });
  };

  return { logOut, purchase, restore, retryReconciliation, syncUser };
};
