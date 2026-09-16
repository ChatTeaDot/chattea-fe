import * as SecureStore from "expo-secure-store";

import { DEFAULT_NOTIFICATION_PREFERENCES, NOTIFICATION_PREFERENCES_KEY } from "../constants";
import type { NotificationPreferences } from "../types";

const parsePreferences = (value: string | null): NotificationPreferences => {
  if (!value) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    const match = Reflect.get(parsed, "match");
    const message = Reflect.get(parsed, "message");
    if (typeof match !== "boolean" || typeof message !== "boolean") {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
    return { match, message };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
};

export const loadNotificationPreferences = async (): Promise<NotificationPreferences> =>
  parsePreferences(await SecureStore.getItemAsync(NOTIFICATION_PREFERENCES_KEY));

export const saveNotificationPreferences = async (
  preferences: NotificationPreferences,
): Promise<void> => {
  await SecureStore.setItemAsync(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
};
