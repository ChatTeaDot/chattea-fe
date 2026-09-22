import { router } from "expo-router";
import { type PropsWithChildren, useEffect, useRef } from "react";

import { useRevenueCat } from "@/features/billing";
import { CommunityWebviewPrewarm } from "@/features/community";
import { usePushNotifications } from "@/features/notifications";
import { apolloClient } from "@/shared/graphql";

import PushNotificationsProvider from "./push-notifications-provider";
import RevenueCatProvider from "./revenuecat-provider";
import { useSession } from "./session-provider";
import { useProviderInitMetric } from "./utils/provider-init-metrics";
import { performForcedSessionTermination } from "./utils/session-actions";

const SessionTerminationCoordinator = () => {
  const revenueCat = useRevenueCat();
  const pushNotifications = usePushNotifications();
  const { completeSessionTermination, setSession, terminationRequested } = useSession();
  const running = useRef(false);

  useEffect(() => {
    if (!terminationRequested || running.current) return;
    running.current = true;
    void performForcedSessionTermination({
      clearCache: async () => {
        await apolloClient.clearStore();
      },
      clearSession: () => setSession(null),
      logOutRevenueCat: revenueCat.logOut,
      unregisterPush: pushNotifications.unregisterInstallation,
    }).finally(() => {
      running.current = false;
      completeSessionTermination();
      router.replace("/");
    });
  }, [
    completeSessionTermination,
    pushNotifications.unregisterInstallation,
    revenueCat.logOut,
    setSession,
    terminationRequested,
  ]);

  return null;
};

const NativeIntegrationsProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("native-integrations");

  return (
    <RevenueCatProvider>
      <PushNotificationsProvider>
        <SessionTerminationCoordinator />
        <CommunityWebviewPrewarm />
        {children}
      </PushNotificationsProvider>
    </RevenueCatProvider>
  );
};

export default NativeIntegrationsProvider;
