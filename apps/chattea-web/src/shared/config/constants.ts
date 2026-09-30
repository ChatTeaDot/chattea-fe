export const WEB_DEV_PORT = 3000;

export const COMMUNITY_PATH = "/community";

export const VITALS_PATH = "/vitals";

export const VITAL_METRIC_NAMES = ["LCP", "FCP", "INP", "CLS", "TTFB"] as const;

export const API_GRAPHQL_PATH = "/api/graphql";

export const TRACE_FORWARD_HEADERS = [
  "traceparent",
  "tracestate",
  "x-datadog-trace-id",
  "x-datadog-parent-id",
  "x-datadog-sampling-priority",
  "x-datadog-origin",
  "x-b3-traceid",
  "x-b3-spanid",
  "x-b3-sampled",
] as const;

export const COMMUNITY_NAVIGATE_MESSAGE_TYPE = "chattea.community.navigate";

export const COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE = "chattea.community.auth-refresh";

export const COMMUNITY_AUTH_REFRESHED_EVENT = "chattea:auth-refreshed";

export const COMMUNITY_AUTH_FAILED_EVENT = "chattea:auth-failed";

export const COMMUNITY_AUTH_REFRESH_TIMEOUT_MS = 10_000;

export const COMMUNITY_NEW_PATH = "/community/new";

export const COMMUNITY_POST_PATH_PREFIX = "/community/";
