import type { RevenueCatState } from "@/features/billing";
import type { PushRegistrationState } from "@/features/notifications";

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
  message: "로그인 후 결제 정보를 확인할 수 있어요.",
  status: "disabled",
};

export const INITIAL_PUSH_STATE: PushRegistrationState = {
  message: "로그인 후 원격 알림을 설정할 수 있어요.",
  status: "disabled",
};
