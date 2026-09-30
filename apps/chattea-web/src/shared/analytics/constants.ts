export const DATADOG_APPLICATION_ID = import.meta.env?.VITE_DATADOG_APP_ID as string | undefined;

export const DATADOG_CLIENT_TOKEN = import.meta.env?.VITE_DATADOG_CLIENT_TOKEN as
  | string
  | undefined;

export const DATADOG_SITE =
  (import.meta.env?.VITE_DATADOG_SITE as string | undefined) ?? "datadoghq.com";

export const POSTHOG_KEY = import.meta.env?.VITE_POSTHOG_KEY as string | undefined;

export const POSTHOG_HOST =
  (import.meta.env?.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

export const SERVICE_NAME = "chattea-web";

export const SERVICE_ENV = (import.meta.env?.MODE as string | undefined) ?? "production";
