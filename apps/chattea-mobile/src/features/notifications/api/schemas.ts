export type AppNotification = {
  body: string;
  createdAt: string;
  id: string;
  readAt: string | null;
  route: string | null;
  title: string;
  type: string;
};

export type NotificationsData = { notifications: AppNotification[] };

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
