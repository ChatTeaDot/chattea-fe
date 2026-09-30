import type { RevenueCatState } from "@/features/billing";
import type { PushRegistrationState } from "@/features/notifications";
import i18n from "@/i18n";

export const PUBLIC_ROOTS = new Set(["index", "signup"]);

export const SESSION_KEY = "chattea.session";

export const devSessionToken = process.env.EXPO_PUBLIC_DEV_SESSION_TOKEN;

export const devRefreshToken = process.env.EXPO_PUBLIC_DEV_REFRESH_TOKEN;

export const serviceName = "chattea-fe";

export const serviceEnv = process.env.EXPO_PUBLIC_SERVICE_ENV ?? "development";

export const serviceVersion = process.env.EXPO_PUBLIC_SERVICE_VERSION ?? "dev";

export const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const datadogClientToken = process.env.EXPO_PUBLIC_DATADOG_CLIENT_TOKEN;

export const datadogRumApplicationId = process.env.EXPO_PUBLIC_DATADOG_RUM_APPLICATION_ID;

export const INITIAL_BILLING_STATE: RevenueCatState = {
  message: i18n.t("errors.loginRequired", { ns: "billing" }),
  status: "disabled",
};

export const INITIAL_PUSH_STATE: PushRegistrationState = {
  message: i18n.t("errors.loginRequired", { ns: "notifications" }),
  status: "disabled",
};
