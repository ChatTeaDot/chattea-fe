import { createContext, useContext } from "react";

import type { createNotificationNavigationCoordinator } from "./notification-route";
import type { PushNotificationsContextValue } from "./types";

export type NotificationNavigationCoordinator = ReturnType<
  typeof createNotificationNavigationCoordinator
>;

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
