import type { RevenueCatState } from "./revenuecat-lifecycle";

export type BillingProduct = {
  id: string;
  kind: "boost" | "subscription" | "superlike";
  name: string;
};

export type ConsumableBalance = {
  activeBoostUntil: string | null;
  boostCredits: number;
  superLikeCredits: number;
};

export type CurrentSubscription = {
  planId: "basic" | "black" | "free" | "gold";
};

export type RevenueCatContextValue = {
  logOut: () => Promise<void>;
  purchase: (productId: string) => Promise<"cancelled" | "purchased" | "stale">;
  restore: () => Promise<"restored" | "stale">;
  state: RevenueCatState;
};
