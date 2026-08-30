import type { PushRegistrationState } from "./push-registration";

export type AppNotification = {
  body: string;
  createdAt: string;
  id: string;
  readAt: string | null;
  route: string | null;
  title: string;
  type: string;
};

export type PushNotificationsContextValue = {
  clearLocal: () => Promise<void>;
  state: PushRegistrationState;
  unregisterInstallation: () => Promise<void>;
};
