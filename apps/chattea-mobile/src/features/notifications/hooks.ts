import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { showActionError } from "@/shared/lib";

import {
  type AppNotification,
  MARK_NOTIFICATION_READ_MUTATION,
  NOTIFICATIONS_QUERY,
  type NotificationsData,
} from "./api";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "./constants";
import { loadNotificationPreferences, saveNotificationPreferences } from "./storage";
import type {
  NotificationNavigationCoordinator,
  NotificationPreferences,
  PushNotificationsContextValue,
} from "./types";
import { parseNotificationRoute } from "./utils/notification-route";

export const NotificationNavigationContext =
  createContext<NotificationNavigationCoordinator | null>(null);

export const PushNotificationsContext = createContext<PushNotificationsContextValue | null>(null);

export const usePushNotifications = (): PushNotificationsContextValue => {
  const value = useContext(PushNotificationsContext);
  if (!value) throw new Error("PushNotificationsProvider missing");
  return value;
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });
  useEffect(() => {
    void loadNotificationPreferences().then(setPreferences);
  }, []);
  const setPreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      void saveNotificationPreferences(next);
      return next;
    });
  };
  return { preferences, setPreference };
};

export const useNotificationNavigation = (): NotificationNavigationCoordinator => {
  const value = useContext(NotificationNavigationContext);
  if (!value) throw new Error("NotificationNavigationProvider missing");
  return value;
};

export const useNotifications = () => {
  const notifications = useQuery<NotificationsData>(NOTIFICATIONS_QUERY, {
    fetchPolicy: "cache-first",
  });
  const [markRead] = useMutation<{ markNotificationRead: boolean }>(
    MARK_NOTIFICATION_READ_MUTATION,
  );
  const refetchNotifications = notifications.refetch;
  const visit = useCallback(
    async (notification: AppNotification) => {
      try {
        if (!notification.readAt)
          await markRead({ variables: { notificationId: notification.id } });
        const route = parseNotificationRoute(notification.route);
        if (route) router.push(route);
        void refetchNotifications();
      } catch {
        showActionError();
      }
    },
    [markRead, refetchNotifications],
  );

  return { notifications, visit };
};
