import { useQuery } from "@apollo/client/react";
import { createContext, useContext, useMemo, useState } from "react";
import { Alert } from "react-native";

import { showActionError } from "@/shared/lib";

import {
  BILLING_PRODUCTS_QUERY,
  CONSUMABLE_BALANCE_QUERY,
  CURRENT_SUBSCRIPTION_QUERY,
} from "./api";
import {
  type BillingProduct,
  type ConsumableBalance,
  type CurrentSubscription,
  type RevenueCatContextValue,
} from "./types";

export const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

export const useRevenueCat = (): RevenueCatContextValue => {
  const value = useContext(RevenueCatContext);
  if (!value) throw new Error("RevenueCatProvider missing");
  return value;
};

export const usePremiumBilling = () => {
  const products = useQuery<{ billingProducts: BillingProduct[] }>(BILLING_PRODUCTS_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  const subscription = useQuery<{ currentSubscription: CurrentSubscription }>(
    CURRENT_SUBSCRIPTION_QUERY,
  );
  const revenueCat = useRevenueCat();
  const [pending, setPending] = useState(false);
  const backendStateUnavailable =
    balance.loading ||
    subscription.loading ||
    Boolean(balance.error) ||
    Boolean(subscription.error) ||
    !balance.data ||
    !subscription.data;
  const reconciliationPending =
    revenueCat.state.status === "ready" && revenueCat.state.reconciliationPending;
  const purchase = async (product: BillingProduct) => {
    setPending(true);
    try {
      const result = await revenueCat.purchase(product.id);
      if (result === "purchased") {
        Alert.alert("구매를 확인하고 있어요", "스토어 처리가 끝나면 혜택이 자동으로 반영돼요.");
      }
    } catch {
      showActionError();
    } finally {
      setPending(false);
    }
  };
  const restore = async () => {
    setPending(true);
    try {
      const result = await revenueCat.restore();
      if (result === "restored") {
        Alert.alert("구매 복원을 요청했어요", "복원된 혜택을 계정에서 다시 확인할게요.");
      }
    } catch {
      showActionError();
    } finally {
      setPending(false);
    }
  };
  const grouped = useMemo(() => {
    const all = products.data?.billingProducts ?? [];
    return {
      subscriptions: all.filter((item) => item.kind === "subscription"),
      items: all.filter((item) => item.kind !== "subscription"),
    };
  }, [products.data?.billingProducts]);

  return {
    products,
    balance,
    subscription,
    revenueCat,
    pending,
    backendStateUnavailable,
    reconciliationPending,
    purchase,
    restore,
    grouped,
  };
};
