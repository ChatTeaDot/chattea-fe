import { useSegments } from "expo-router";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

import type { RevenueCatState } from "@/features/billing";
import {
  createRevenueCatLifecycle,
  readBackendBillingState,
  refreshBackendBillingState,
  RevenueCatContext,
  revenueCatSdk,
} from "@/features/billing";

import { useAuthenticatedUserId } from "./authenticated-user";
import { INITIAL_BILLING_STATE } from "./constants";
import { measureProviderInit, useProviderInitMetric } from "./utils/provider-init-metrics";

const RevenueCatProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("revenuecat");
  const userId = useAuthenticatedUserId();
  const segments = useSegments() as string[];
  const activated = useRef(false);
  const [state, setState] = useState<RevenueCatState>(INITIAL_BILLING_STATE);
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
    if (!activated.current && !segments.includes("premium")) return;
    activated.current = true;
    void measureProviderInit("revenuecat:sync", () => lifecycle.syncUser(userId));
  }, [lifecycle, segments, userId]);

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

export default RevenueCatProvider;
