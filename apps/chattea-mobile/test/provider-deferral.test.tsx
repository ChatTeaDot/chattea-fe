import { createElement, type ReactElement, type ReactNode } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ObservabilityProvider from "../src/providers/observability-provider";
import PushNotificationsProvider from "../src/providers/push-notifications-provider";
import RevenueCatProvider from "../src/providers/revenuecat-provider";
import {
  getProviderInitMetrics,
  resetStartupMetrics,
} from "../src/providers/utils/provider-init-metrics";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  process.env.EXPO_PUBLIC_SENTRY_DSN = "https://example.invalid/1";
  return {
    billingLifecycle: {
      logOut: vi.fn(async () => undefined),
      purchase: vi.fn(),
      restore: vi.fn(),
      retryReconciliation: vi.fn(async () => undefined),
      syncUser: vi.fn(async () => undefined),
    },
    idleTasks: [] as (() => void)[],
    notificationResponseListener: vi.fn(() => ({ remove: vi.fn() })),
    pushLifecycle: {
      clearLocal: vi.fn(async () => undefined),
      retry: vi.fn(async () => undefined),
      rotate: vi.fn(async () => undefined),
      start: vi.fn(async () => undefined),
      stop: vi.fn(),
      unregisterInstallation: vi.fn(async () => undefined),
    },
    pushTokenListener: vi.fn(() => ({ remove: vi.fn() })),
    revenueCatSdk: {
      configure: vi.fn(),
      getAppUserID: vi.fn(async () => "user-1"),
      getOfferings: vi.fn(async () => ({ current: { availablePackages: [] } })),
      isConfigured: vi.fn(async () => false),
      logIn: vi.fn(async () => undefined),
      logOut: vi.fn(async () => undefined),
      purchasePackage: vi.fn(async () => undefined),
      restorePurchases: vi.fn(async () => ({ activeSubscriptions: [] })),
    },
    segments: [] as string[],
    sentryInit: vi.fn(),
    setNotificationHandler: vi.fn(),
    userId: "user-1" as string | null,
  };
});

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  Platform: { OS: "ios" },
}));

globalThis.requestIdleCallback = (callback) => {
  mocks.idleTasks.push(callback as () => void);
  return mocks.idleTasks.length;
};
globalThis.cancelIdleCallback = () => undefined;

vi.mock("expo-router", () => ({
  router: { push: vi.fn(), replace: vi.fn() },
  useSegments: () => mocks.segments,
}));

vi.mock("expo-constants", () => ({
  default: {
    easConfig: { projectId: "project-id" },
    expoConfig: { extra: { eas: { projectId: "project-id" } } },
  },
}));

vi.mock("expo-notifications", () => ({
  addNotificationResponseReceivedListener: mocks.notificationResponseListener,
  addPushTokenListener: mocks.pushTokenListener,
  AndroidImportance: { MAX: 5 },
  getExpoPushTokenAsync: vi.fn(async () => ({ data: "ExponentPushToken[t]" })),
  getPermissionsAsync: vi.fn(async () => ({ canAskAgain: true, granted: true })),
  requestPermissionsAsync: vi.fn(async () => ({ canAskAgain: true, granted: true })),
  setNotificationChannelAsync: vi.fn(async () => undefined),
  setNotificationHandler: mocks.setNotificationHandler,
}));

vi.mock("@/providers/authenticated-user", () => ({
  useAuthenticatedUserId: () => mocks.userId,
}));

vi.mock("@/features/billing", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    createRevenueCatLifecycle: vi.fn(() => mocks.billingLifecycle),
    readBackendBillingState: vi.fn(() => null),
    refreshBackendBillingState: vi.fn(async () => null),
    RevenueCatContext: React.createContext(null),
    revenueCatSdk: mocks.revenueCatSdk,
  };
});

vi.mock("@/features/notifications", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    createPushRegistrationLifecycle: vi.fn(() => mocks.pushLifecycle),
    PushNotificationsContext: React.createContext(null),
    pushRegistrationStorage: { load: vi.fn(async () => null), save: vi.fn(async () => undefined) },
    registerPushToken: vi.fn(),
    unregisterPushToken: vi.fn(),
    useNotificationNavigation: () => ({ handleRuntime: vi.fn(() => null) }),
  };
});

vi.mock("@sentry/react-native", () => ({
  init: mocks.sentryInit,
  wrap: (component: unknown) => component,
}));

vi.mock("@datadog/mobile-react-native", () => ({
  DatadogProvider: ({ children }: { children?: ReactNode }) => children,
  DatadogProviderConfiguration: class {},
  TrackingConsent: { GRANTED: "granted" },
}));

const flushIdle = async () => {
  const tasks = mocks.idleTasks.splice(0);
  for (const task of tasks) task();
  await act(async () => undefined);
};

const render = async (element: ReactElement) => {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
};

describe("provider deferral", () => {
  beforeEach(() => {
    resetStartupMetrics();
    mocks.idleTasks.length = 0;
    mocks.segments = [];
    mocks.userId = "user-1";
    vi.clearAllMocks();
  });

  it("defers RevenueCat sync until the premium route is entered", async () => {
    const renderer = await render(createElement(RevenueCatProvider, null, createElement("div")));

    await flushIdle();
    expect(mocks.billingLifecycle.syncUser).not.toHaveBeenCalled();

    mocks.segments = ["premium"];
    await act(async () => {
      renderer?.update(createElement(RevenueCatProvider, null, createElement("div")));
    });

    expect(mocks.billingLifecycle.syncUser).toHaveBeenCalledWith("user-1");
    expect(getProviderInitMetrics().map((metric) => metric.name)).toContain("revenuecat:sync");
  });

  it("defers RevenueCat sync when the app starts on the premium route", async () => {
    mocks.segments = ["premium"];
    await render(createElement(RevenueCatProvider, null, createElement("div")));

    expect(mocks.billingLifecycle.syncUser).toHaveBeenCalledWith("user-1");
  });

  it("keeps push listeners synchronous but defers registration until interactive", async () => {
    await render(createElement(PushNotificationsProvider, null, createElement("div")));

    expect(mocks.setNotificationHandler).toHaveBeenCalled();
    expect(mocks.notificationResponseListener).toHaveBeenCalled();
    expect(mocks.pushLifecycle.start).not.toHaveBeenCalled();

    await flushIdle();

    expect(mocks.pushLifecycle.start).toHaveBeenCalledWith("user-1");
    expect(getProviderInitMetrics().map((metric) => metric.name)).toContain(
      "push-notifications:register",
    );
  });

  it("does not register push when signed out", async () => {
    mocks.userId = null;
    await render(createElement(PushNotificationsProvider, null, createElement("div")));
    await flushIdle();

    expect(mocks.pushLifecycle.start).not.toHaveBeenCalled();
    expect(mocks.pushLifecycle.stop).toHaveBeenCalled();
  });

  it("defers Sentry init until after interactions instead of module import", async () => {
    expect(mocks.sentryInit).not.toHaveBeenCalled();

    await render(createElement(ObservabilityProvider, null, createElement("div")));
    expect(mocks.sentryInit).not.toHaveBeenCalled();

    await flushIdle();
    expect(mocks.sentryInit).toHaveBeenCalledTimes(1);
  });
});
