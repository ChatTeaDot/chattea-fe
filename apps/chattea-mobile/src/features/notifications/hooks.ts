import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { createContext, useCallback, useContext } from "react";

import { showActionError } from "@/shared/lib";

import { MARK_NOTIFICATION_READ_MUTATION, NOTIFICATIONS_QUERY } from "./api";
import type {
  AppNotification,
  NotificationNavigationCoordinator,
  NotificationsData,
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

export const useNotificationNavigation = (): NotificationNavigationCoordinator => {
  const value = useContext(NotificationNavigationContext);
  if (!value) throw new Error("NotificationNavigationProvider missing");
  return value;
};

export const useNotifications = () => {
  const notifications = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
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
