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

export type RevenueCatPackage = {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
  };
};

export type RevenueCatOfferings = {
  current: {
    availablePackages: RevenueCatPackage[];
  } | null;
};

export type RevenueCatCustomerInfo = {
  activeSubscriptions: string[];
};

export type RevenueCatSdk = {
  configure: (input: { apiKey: string; appUserID: string }) => void;
  getAppUserID: () => Promise<string>;
  getOfferings: () => Promise<RevenueCatOfferings>;
  isConfigured: () => Promise<boolean>;
  logIn: (userId: string) => Promise<void>;
  logOut: () => Promise<void>;
  purchasePackage: (selectedPackage: RevenueCatPackage) => Promise<void>;
  restorePurchases: () => Promise<RevenueCatCustomerInfo>;
};

export type BackendBillingState = {
  boostCredits: number;
  planId: "basic" | "black" | "free" | "gold";
  superLikeCredits: number;
};

export type RevenueCatState =
  | { status: "loading" }
  | { status: "disabled" | "error"; message: string }
  | {
      status: "ready";
      userId: string;
      packages: Record<string, { package: RevenueCatPackage; priceString: string }>;
      reconciliationPending: boolean;
    };

export type RevenueCatLifecycleInput = {
  keys: { android?: string; ios?: string };
  onState: (state: RevenueCatState) => void;
  platform: string;
  readBackendState: () => BackendBillingState | null;
  reconciliationDelaysMs?: readonly number[];
  reconciliationRetryDelayMs?: number;
  refreshBackend: () => Promise<BackendBillingState | null>;
  scheduleRetry?: (retry: () => void, delayMs: number) => () => void;
  sdk: RevenueCatSdk;
  wait?: (delayMs: number) => Promise<void>;
};

export type RevenueCatKeys = RevenueCatLifecycleInput["keys"];

export type RevenueCatPlatform = "android" | "ios" | string;

export type RevenueCatPackageMap = Record<
  string,
  { package: RevenueCatPackage; priceString: string }
>;

export type ReconciliationRequest = {
  baseline: BackendBillingState | null;
  generation: number;
  productId: string | null;
  restoreExpectation: "no-active" | "unknown" | null;
  userId: string;
};

export type PlanCardMeta = {
  description: string;
  fallbackPrice: string;
  name: string;
  planId: CurrentSubscription["planId"];
  productId: string | null;
};

export type PlanCardProps = {
  card: PlanCardMeta;
  disabled: boolean;
  onPress: () => void;
  price?: string;
  selected: boolean;
};
