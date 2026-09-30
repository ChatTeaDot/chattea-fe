export const ANALYTICS_EVENT = {
  communityView: "community_view",
  postView: "post_view",
  postCreate: "post_create",
  commentCreate: "comment_create",
  messageSend: "message_send",
  tabSwitch: "tab_switch",
  webviewEnter: "webview_enter",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];

export type AnalyticsProps = {
  screen: string;
  source: string;
} & Record<string, unknown>;

export const ANALYTICS_SCREEN = {
  community: "community",
} as const;
