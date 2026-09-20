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

export type BackendBillingState = {
  boostCredits: number;
  planId: "basic" | "black" | "free" | "gold";
  superLikeCredits: number;
};
