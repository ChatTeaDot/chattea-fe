export const COMMUNITY_CATEGORIES = ["연애", "일상", "질문"] as const;

export const COMMUNITY_TITLE_MAX_LENGTH = 80;

export const COMMUNITY_BODY_MAX_LENGTH = 1000;

const defaultCommunityWebUrl =
  process.env.EXPO_OS === "android"
    ? "http://10.0.2.2:3000/community"
    : "http://localhost:3000/community";

export const communityWebUrl =
  process.env.EXPO_PUBLIC_COMMUNITY_WEB_URL ?? defaultCommunityWebUrl;

export const communityWebviewPrewarmEnabled =
  process.env.EXPO_PUBLIC_COMMUNITY_WEBVIEW_PREWARM !== "0";

export const COMMUNITY_VITALS_MESSAGE_TYPE = "chattea.community.vital";

export const COMMUNITY_NAVIGATE_MESSAGE_TYPE = "chattea.community.navigate";

export const COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE = "chattea.community.auth-refresh";

export const COMMUNITY_AUTH_REFRESHED_EVENT = "chattea:auth-refreshed";

export const COMMUNITY_AUTH_FAILED_EVENT = "chattea:auth-failed";

export const COMMUNITY_NAVIGABLE_PREFIX = "/community";

export const WEBVIEW_TRACE_TAG = "[webview-trace]";

export const webviewTraceReportUrl = process.env.EXPO_PUBLIC_WEBVIEW_TRACE_URL;

export const WEBVIEW_TRACE_SETTLE_MS = 4000;
