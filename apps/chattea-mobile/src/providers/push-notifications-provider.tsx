import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Platform } from "react-native";

import {
  createPushRegistrationLifecycle,
  PushNotificationsContext,
  pushRegistrationStorage,
  registerPushToken,
  unregisterPushToken,
  useNotificationNavigation,
} from "@/features/notifications";
import { type PushRegistrationState } from "@/features/notifications";

import { useAuthenticatedUserId } from "./authenticated-user";
import { INITIAL_PUSH_STATE } from "./constants";

const getProjectId = (): string | null => {
  const extra = Constants.expoConfig?.extra;
  const fallback =
    extra &&
    typeof extra === "object" &&
    "eas" in extra &&
    extra.eas &&
    typeof extra.eas === "object"
      ? Reflect.get(extra.eas, "projectId")
      : undefined;
  const projectId = Constants.easConfig?.projectId ?? fallback;
  return typeof projectId === "string" && projectId.trim() ? projectId.trim() : null;
};

const PushNotificationsProvider = ({ children }: PropsWithChildren) => {
  const userId = useAuthenticatedUserId();
  const notificationNavigation = useNotificationNavigation();
  const [state, setState] = useState<PushRegistrationState>(INITIAL_PUSH_STATE);
  const [lifecycle] = useState(() =>
    createPushRegistrationLifecycle({
      backend: { register: registerPushToken, unregister: unregisterPushToken },
      onState: setState,
      platform: Platform.OS,
      projectId: getProjectId(),
      sdk: {
        getExpoPushToken: (input) =>
          Notifications.getExpoPushTokenAsync({
            devicePushToken: input.devicePushToken as Notifications.DevicePushToken | undefined,
            projectId: input.projectId,
          }),
        getPermissions: () => Notifications.getPermissionsAsync(),
        prepareAndroidChannel: async () => {
          await Notifications.setNotificationChannelAsync("default", {
            importance: Notifications.AndroidImportance.MAX,
            name: "기본 알림",
            sound: "default",
          });
        },
        requestPermissions: () => Notifications.requestPermissionsAsync(),
      },
      storage: pushRegistrationStorage,
    }),
  );

  useEffect(() => {
    if (!userId) {
      Notifications.setNotificationHandler(null);
      lifecycle.stop();
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    void lifecycle.start(userId).catch(() => undefined);

    const openResponse = (response: Notifications.NotificationResponse) => {
      const route = notificationNavigation.handleRuntime(response);
      if (route) router.push(route);
    };
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(openResponse);
    const tokenSubscription = Notifications.addPushTokenListener((token) => {
      void lifecycle.rotate(token).catch(() => undefined);
    });
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void lifecycle.retry().catch(() => undefined);
    });

    return () => {
      appStateSubscription.remove();
      responseSubscription.remove();
      tokenSubscription.remove();
      Notifications.setNotificationHandler(null);
      lifecycle.stop();
    };
  }, [lifecycle, notificationNavigation, userId]);

  const clearLocal = useCallback(() => lifecycle.clearLocal(), [lifecycle]);
  const unregisterInstallation = useCallback(() => lifecycle.unregisterInstallation(), [lifecycle]);
  const value = useMemo(
    () => ({ clearLocal, state, unregisterInstallation }),
    [clearLocal, state, unregisterInstallation],
  );

  return (
    <PushNotificationsContext.Provider value={value}>{children}</PushNotificationsContext.Provider>
  );
};

export default PushNotificationsProvider;
