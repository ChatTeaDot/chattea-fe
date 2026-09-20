export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const EXACT_ROUTES = new Set(["/likes", "/premium", "/profile", "/rooms"]);

export const PUSH_REGISTRATION_KEY = "chattea.pushRegistration.v1";

export const NOTIFICATION_PREFERENCES_KEY = "chattea.notificationPreferences.v1";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  match: true,
  message: true,
} as const;
