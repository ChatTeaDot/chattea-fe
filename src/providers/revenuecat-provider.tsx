import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Platform } from "react-native";

import { useAuthenticatedUserId } from "@/features/native/authenticated-user";
import { readBackendBillingState, refreshBackendBillingState } from "@/features/native/billing/api";
import { RevenueCatContext } from "@/features/native/billing/hooks";
import { revenueCatSdk } from "@/features/native/billing/revenuecat";
import type { RevenueCatState } from "@/features/native/billing/revenuecat-lifecycle";
import { createRevenueCatLifecycle } from "@/features/native/billing/revenuecat-lifecycle";
import type { RevenueCatContextValue } from "@/features/native/billing/types";

const initialState: RevenueCatContextValue["state"] = {
  message: "로그인 후 결제 정보를 확인할 수 있어요.",
  status: "disabled",
};

export const RevenueCatProvider = ({ children }: PropsWithChildren) => {
  const userId = useAuthenticatedUserId();
  const [state, setState] = useState<RevenueCatState>(initialState);
  const [lifecycle] = useState(() =>
    createRevenueCatLifecycle({
      keys: {
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
      },
      onState: setState,
      platform: Platform.OS,
      readBackendState: readBackendBillingState,
      refreshBackend: refreshBackendBillingState,
      sdk: revenueCatSdk,
    }),
  );

  useEffect(() => {
    void lifecycle.syncUser(userId);
  }, [lifecycle, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void lifecycle.retryReconciliation();
    });
    return () => subscription.remove();
  }, [lifecycle]);

  const logOut = useCallback(() => lifecycle.logOut(), [lifecycle]);
  const purchase = useCallback((productId: string) => lifecycle.purchase(productId), [lifecycle]);
  const restore = useCallback(() => lifecycle.restore(), [lifecycle]);
  const value = useMemo(
    () => ({ logOut, purchase, restore, state }),
    [logOut, purchase, restore, state],
  );

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
};
