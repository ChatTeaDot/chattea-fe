export const BILLING_PRODUCT_IDS = new Set([
  "chattea_basic_monthly",
  "chattea_gold_monthly",
  "chattea_black_monthly",
  "chattea_boost_30m",
  "chattea_superlikes_5",
]);

export const SUBSCRIPTION_PRODUCT_IDS = new Set([
  "chattea_basic_monthly",
  "chattea_gold_monthly",
  "chattea_black_monthly",
]);

export const DEFAULT_RECONCILIATION_DELAYS_MS = [0, 1_000, 3_000] as const;

export const PLAN_CARDS = [
  {
    name: "Free",
    planId: "free",
    productId: null,
  },
  {
    name: "Basic",
    planId: "basic",
    productId: "chattea_basic_monthly",
  },
  {
    name: "Gold",
    planId: "gold",
    productId: "chattea_gold_monthly",
  },
  {
    name: "Black",
    planId: "black",
    productId: "chattea_black_monthly",
  },
] as const;
