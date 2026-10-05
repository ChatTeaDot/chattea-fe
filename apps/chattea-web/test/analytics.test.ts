import { describe, expect, it } from "vitest";

import { ANALYTICS_EVENT, initAnalytics, initDatadogRum, track } from "@/shared/analytics";

describe("analytics", () => {
  it("no-ops when env keys are unset", () => {
    expect(() => initDatadogRum()).not.toThrow();
    expect(() => initAnalytics()).not.toThrow();
    expect(() =>
      track(ANALYTICS_EVENT.communityView, { screen: "community", source: "test" }),
    ).not.toThrow();
  });

  it("keeps the shared event schema stable", () => {
    expect(Object.values(ANALYTICS_EVENT)).toEqual([
      "community_view",
      "post_view",
      "post_create",
      "comment_create",
      "message_send",
      "tab_switch",
      "webview_enter",
    ]);
  });
});
