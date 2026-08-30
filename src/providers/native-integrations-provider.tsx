import { router } from "expo-router";
import { type PropsWithChildren, useEffect, useRef } from "react";

import { useRevenueCat } from "@/features/native/billing";
import { usePushNotifications } from "@/features/native/notifications";
import { performForcedSessionTermination } from "@/features/native/session-actions";
import { apolloClient } from "@/shared/graphql";

import { PushNotificationsProvider } from "./push-notifications-provider";
import { RevenueCatProvider } from "./revenuecat-provider";
import { useSession } from "./session-provider";

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

export const NativeIntegrationsProvider = ({ children }: PropsWithChildren) => (
  <RevenueCatProvider>
    <PushNotificationsProvider>
      <SessionTerminationCoordinator />
      {children}
    </PushNotificationsProvider>
  </RevenueCatProvider>
);
