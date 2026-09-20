import { createRequire } from "node:module";

import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RevenueCatContext } from "../src/features/billing/hooks";
import type { RevenueCatContextValue } from "../src/features/billing/types";
import PremiumScreen from "../src/screens/premium-screen";

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

const billing = vi.hoisted(() => ({
  value: {
    logOut: vi.fn(() => Promise.resolve()),
    purchase: vi.fn(() => Promise.resolve("purchased" as const)),
    restore: vi.fn(() => Promise.resolve("restored" as const)),
    state: {
      message: "이 빌드에는 App Store 결제가 설정되지 않았어요.",
      status: "disabled" as const,
    },
  } as RevenueCatContextValue,
}));

vi.mock("@apollo/client/react", () => ({
  useQuery: (query: { loc?: { source?: { body?: string } } }) => {
    const source = query.loc?.source?.body ?? "";
    if (source.includes("NativeBillingProducts")) {
      return {
        data: {
          billingProducts: [{ id: "chattea_gold_monthly", kind: "subscription", name: "Gold" }],
        },
        error: undefined,
        loading: false,
      };
    }
    if (source.includes("NativeConsumableBalance")) {
      return {
        data: { consumableBalance: { boostCredits: 2, superLikeCredits: 3 } },
        error: undefined,
        loading: false,
      };
    }
    return {
      data: { currentSubscription: { planId: "free" } },
      error: undefined,
      loading: false,
    };
  },
}));
vi.mock("../src/shared/components", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    AppButton: ({ disabled, title }: { disabled?: boolean; title: string }) =>
      React.createElement("button", { disabled }, title),
    BottomCta: ({ children }: { children?: ReactNode }) =>
      React.createElement("footer", null, children),
    NativeScreen: ({ children }: { children?: ReactNode }) =>
      React.createElement("main", null, children),
  };
});
vi.mock("../src/shared/lib", () => ({
  showActionError: vi.fn(),
}));
vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Alert: { alert: vi.fn() },
    Pressable: ({ children, disabled }: { children?: ReactNode; disabled?: boolean }) =>
      React.createElement("button", { disabled: Boolean(disabled) }, children),
    ScrollView: ({ children }: { children?: ReactNode }) =>
      React.createElement("section", null, children),
    Text: ({ children }: { children?: ReactNode }) => React.createElement("span", null, children),
    View: ({ children }: { children?: ReactNode }) => React.createElement("div", null, children),
  };
});
vi.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children?: ReactNode }) => children,
}));

vi.mock("react-native-unistyles", () => ({ StyleSheet: { create: () => ({}) } }));

const renderPremium = () =>
  renderToStaticMarkup(
    createElement(
      RevenueCatContext.Provider,
      { value: billing.value },
      createElement(PremiumScreen),
    ),
  );

describe("premium screen", () => {
  beforeEach(() => {
    billing.value = {
      logOut: vi.fn(() => Promise.resolve()),
      purchase: vi.fn(() => Promise.resolve("purchased" as const)),
      restore: vi.fn(() => Promise.resolve("restored" as const)),
      state: {
        message: "이 빌드에는 App Store 결제가 설정되지 않았어요.",
        status: "disabled",
      },
    };
  });

  it("shows the configuration reason and disables purchase and restore controls", () => {
    const markup = renderPremium();

    expect(markup).toContain("이 빌드에는 App Store 결제가 설정되지 않았어요.");
    expect(markup).toContain('<button disabled="">Gold 구독하기</button>');
    expect(markup).toMatch(/<button disabled=""><span>이전 구매 복원<\/span><\/button>/);
  });

  it("shows the store price and enables purchase for an exactly mapped product", () => {
    billing.value = {
      logOut: vi.fn(() => Promise.resolve()),
      purchase: vi.fn(() => Promise.resolve("purchased" as const)),
      restore: vi.fn(() => Promise.resolve("restored" as const)),
      state: {
        packages: {
          chattea_gold_monthly: {
            package: {
              identifier: "gold-package",
              product: { identifier: "chattea_gold_monthly", priceString: "₩9,900" },
            },
            priceString: "₩9,900",
          },
        },
        reconciliationPending: false,
        status: "ready",
        userId: "user-1",
      },
    };

    const markup = renderPremium();

    expect(markup).toContain("₩9,900");
    expect(markup).toContain("<button>Gold 구독하기</button>");
    expect(markup).toMatch(/<button><span>이전 구매 복원<\/span><\/button>/);
  });

  it("keeps store controls disabled while backend reconciliation is pending", () => {
    billing.value = {
      logOut: vi.fn(() => Promise.resolve()),
      purchase: vi.fn(() => Promise.resolve("purchased" as const)),
      restore: vi.fn(() => Promise.resolve("restored" as const)),
      state: {
        packages: {
          chattea_gold_monthly: {
            package: {
              identifier: "gold-package",
              product: { identifier: "chattea_gold_monthly", priceString: "₩9,900" },
            },
            priceString: "₩9,900",
          },
        },
        reconciliationPending: true,
        status: "ready",
        userId: "user-1",
      },
    };

    const markup = renderPremium();

    expect(markup).toContain("스토어 구매를 서버 계정에 반영하고 있어요.");
    expect(markup).toContain('<button disabled="">Gold 구독하기</button>');
    expect(markup).toMatch(/<button disabled=""><span>이전 구매 복원<\/span><\/button>/);
  });
});

vi.mock("react-native-purchases", () => ({ default: {} }));
