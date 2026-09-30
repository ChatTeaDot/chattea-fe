export declare const ANALYTICS_EVENT: {
    readonly communityView: "community_view";
    readonly postView: "post_view";
    readonly postCreate: "post_create";
    readonly commentCreate: "comment_create";
    readonly messageSend: "message_send";
    readonly tabSwitch: "tab_switch";
    readonly webviewEnter: "webview_enter";
};
export type AnalyticsEvent = (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];
export type AnalyticsProps = {
    screen: string;
    source: string;
} & Record<string, unknown>;
export declare const ANALYTICS_SCREEN: {
    readonly community: "community";
};
