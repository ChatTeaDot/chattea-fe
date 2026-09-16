import { createRequire } from "node:module";

import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NativeSessionGate from "../src/providers/session-gate";

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

const mocks = vi.hoisted(() => ({
  error: new Error("SESSION_REFRESH_UNAVAILABLE"),
  refetch: vi.fn(() => Promise.resolve()),
  requestSessionTermination: vi.fn(),
  retryPress: undefined as (() => void) | undefined,
}));

vi.mock("expo-secure-store", () => ({}));
vi.mock("@/features/profile", () => import("../src/features/profile/api"));
vi.mock("@/features/notifications", async () => ({
  ...(await import("../src/features/notifications/hooks")),
  ...(await import("../src/features/notifications/utils/notification-route")),
}));
vi.mock("@apollo/client/react", () => ({
  useQuery: () => ({
    data: undefined,
    error: mocks.error,
    loading: false,
    refetch: mocks.refetch,
  }),
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({
    hydrated: true,
    requestSessionTermination: mocks.requestSessionTermination,
    session: {
      accessToken: "access.payload.signature",
      refreshToken: "refresh.payload.signature",
    },
  }),
}));
vi.mock("expo-notifications", () => ({
  clearLastNotificationResponse: vi.fn(),
  getLastNotificationResponse: vi.fn(() => null),
}));
vi.mock("expo-router", () => ({
  router: { replace: vi.fn() },
  useSegments: () => [],
}));
vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Pressable: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => {
      mocks.retryPress = onPress;
      return React.createElement("button", null, children);
    },
    Text: ({ children }: { children?: ReactNode }) => React.createElement("span", null, children),
    View: ({
      accessibilityElementsHidden,
      children,
    }: {
      accessibilityElementsHidden?: boolean;
      children?: ReactNode;
    }) =>
      React.createElement(
        "div",
        accessibilityElementsHidden ? { "aria-hidden": "true" } : null,
        children,
      ),
  };
});
vi.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (factory: (theme: Record<string, unknown>) => unknown) =>
      factory({
        colors: { background: "#fff", muted: "#777", primary: "#000", primaryText: "#fff" },
        spacing: { sm: 8, md: 16 },
      }),
  },
}));

describe("native session gate", () => {
  beforeEach(() => {
    mocks.error = new Error("SESSION_REFRESH_UNAVAILABLE");
    mocks.refetch.mockClear();
    mocks.requestSessionTermination.mockClear();
    mocks.retryPress = undefined;
  });

  it("shows a retryable state instead of a blank authenticated root after transient refresh failure", () => {
    const markup = renderToStaticMarkup(
      createElement(NativeSessionGate, null, createElement("main", null, "protected content")),
    );

    expect(markup).toContain("연결을 확인하지 못했어요");
    expect(markup).toContain("다시 시도");
    expect(markup).not.toContain("protected content");

    mocks.retryPress?.();
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it("keeps the termination coordinator mounted behind the blocking state on authentication failure", () => {
    mocks.error = new Error("UNAUTHENTICATED");

    const markup = renderToStaticMarkup(
      createElement(NativeSessionGate, null, createElement("main", null, "protected content")),
    );

    expect(markup).toContain("ChatTea를 준비하고 있어요");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("protected content");
  });
});
