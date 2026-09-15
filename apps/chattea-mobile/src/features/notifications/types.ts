import { type createNotificationNavigationCoordinator } from "./utils/notification-route";

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

export type NotificationsData = { notifications: AppNotification[] };

export type NotificationNavigationCoordinator = ReturnType<
  typeof createNotificationNavigationCoordinator
>;

export type NotificationRoute =
  | "/likes"
  | "/premium"
  | "/profile"
  | "/rooms"
  | `/community/${string}`
  | `/room/${string}`
  | `/rooms/${string}`;

export type NotificationResponseLike = {
  actionIdentifier: string;
  notification: {
    request: {
      content: { data?: Record<string, unknown> };
      identifier: string;
    };
  };
};

export type DevicePushToken = {
  data: unknown;
  type: string;
};

export type StoredPushRegistration = {
  currentToken: string | null;
  pendingToken: string | null;
  unregisterPending: boolean;
};

export type PushRegistrationStorage = {
  load: () => Promise<StoredPushRegistration>;
  save: (state: StoredPushRegistration) => Promise<void>;
};

export type PushRegistrationSdk = {
  getExpoPushToken: (input: {
    devicePushToken?: DevicePushToken;
    projectId: string;
  }) => Promise<{ data: string }>;
  getPermissions: () => Promise<{ canAskAgain: boolean; granted: boolean }>;
  prepareAndroidChannel: () => Promise<void>;
  requestPermissions: () => Promise<{ canAskAgain: boolean; granted: boolean }>;
};

export type PushBackend = {
  register: (input: { platform: "android" | "ios"; token: string }) => Promise<boolean>;
  unregister: () => Promise<boolean>;
};

export type PushRegistrationState =
  | { status: "loading" | "ready" }
  | { message: string; status: "denied" | "disabled" | "error" };

export type PushRegistrationLifecycleInput = {
  backend: PushBackend;
  onState: (state: PushRegistrationState) => void;
  platform: string;
  projectId: string | null;
  sdk: PushRegistrationSdk;
  storage: PushRegistrationStorage;
};

export type NotificationRowProps = AppNotification & {
  onVisit: (notification: AppNotification) => void;
};

export type NotificationSettingsCardProps = { pushNotifications: { state: PushRegistrationState } };
