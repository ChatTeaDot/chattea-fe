import { createRequire } from "node:module";

import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RevenueCatContextValue } from "../src/features/native/billing/types";
import { PremiumScreen } from "../src/features/native/screens/premium-screen";

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

vi.mock("@/features/native/billing/hooks", () => ({
  useRevenueCat: () => billing.value,
}));
vi.mock("@apollo/client/react", () => ({
  useQuery: (query: { loc?: { source?: { body?: string } } }) => {
    const source = query.loc?.source?.body ?? "";
    if (source.includes("NativeBillingProducts")) {
      return {
        data: {
          billingProducts: [{ id: "chattea_basic_monthly", kind: "subscription", name: "Basic" }],
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
vi.mock("../src/features/native/components", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    MetaText: ({ children }: { children?: ReactNode }) =>
      React.createElement("small", null, children),
    NativeButton: ({
      disabled,
      label,
    }: {
      disabled?: boolean;
      label: string;
      onPress: () => void;
    }) => React.createElement("button", { disabled }, label),
    NativeCard: ({ children }: { children?: ReactNode }) =>
      React.createElement("article", null, children),
    NativeScreen: ({ children }: { children?: ReactNode }) =>
      React.createElement("main", null, children),
    NativeScroll: ({ children }: { children?: ReactNode }) =>
      React.createElement("section", null, children),
    SectionHeading: ({ title }: { title: string }) => React.createElement("h2", null, title),
  };
});
vi.mock("../src/features/native/screens/screen-shared", () => ({
  showActionError: vi.fn(),
  styles: {},
}));
vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Alert: { alert: vi.fn() },
    Text: ({ children }: { children?: ReactNode }) => React.createElement("span", null, children),
    View: ({ children }: { children?: ReactNode }) => React.createElement("div", null, children),
  };
});

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
    const markup = renderToStaticMarkup(createElement(PremiumScreen));

    expect(markup).toContain("이 빌드에는 App Store 결제가 설정되지 않았어요.");
    expect(markup).toContain('<button disabled="">구매하기</button>');
    expect(markup).toContain('<button disabled="">구매 복원</button>');
    expect(markup).not.toContain("결제를 준비하고 있어요");
  });

  it("shows the store price and enables only an exactly mapped product", () => {
    billing.value = {
      logOut: vi.fn(() => Promise.resolve()),
      purchase: vi.fn(() => Promise.resolve("purchased" as const)),
      restore: vi.fn(() => Promise.resolve("restored" as const)),
      state: {
        packages: {
          chattea_basic_monthly: {
            package: {
              identifier: "basic-package",
              product: { identifier: "chattea_basic_monthly", priceString: "₩9,900" },
            },
            priceString: "₩9,900",
          },
        },
        reconciliationPending: false,
        status: "ready",
        userId: "user-1",
      },
    };

    const markup = renderToStaticMarkup(createElement(PremiumScreen));

    expect(markup).toContain("₩9,900");
    expect(markup).toContain("<button>구매하기</button>");
    expect(markup).toContain("<button>구매 복원</button>");
  });

  it("keeps store controls disabled while backend reconciliation is pending", () => {
    billing.value = {
      logOut: vi.fn(() => Promise.resolve()),
      purchase: vi.fn(() => Promise.resolve("purchased" as const)),
      restore: vi.fn(() => Promise.resolve("restored" as const)),
      state: {
        packages: {
          chattea_basic_monthly: {
            package: {
              identifier: "basic-package",
              product: { identifier: "chattea_basic_monthly", priceString: "₩9,900" },
            },
            priceString: "₩9,900",
          },
        },
        reconciliationPending: true,
        status: "ready",
        userId: "user-1",
      },
    };

    const markup = renderToStaticMarkup(createElement(PremiumScreen));

    expect(markup).toContain("스토어 구매를 서버 계정에 반영하고 있어요.");
    expect(markup).toContain('<button disabled="">구매하기</button>');
    expect(markup).toContain('<button disabled="">구매 복원</button>');
  });
});
