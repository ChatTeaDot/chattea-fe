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
    description: "기본 매칭 · 하루 좋아요 제한",
    fallbackPrice: "0원",
    name: "Free",
    planId: "free",
    productId: null,
  },
  {
    description: "좋아요 증가 · 되돌리기 · 광고 제거",
    fallbackPrice: "4,900원",
    name: "Basic",
    planId: "basic",
    productId: "chattea_basic_monthly",
  },
  {
    description: "좋아요 보기 확장 · 고급 필터 · AI 요약",
    fallbackPrice: "9,900원",
    name: "Gold",
    planId: "gold",
    productId: "chattea_gold_monthly",
  },
  {
    description: "Black 전용 추천 · 읽음 확인 · 강한 부스트",
    fallbackPrice: "24,900원",
    name: "Black",
    planId: "black",
    productId: "chattea_black_monthly",
  },
] as const;
