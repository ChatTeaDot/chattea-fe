import { POSTHOG_HOST, POSTHOG_KEY } from "./constants";
import type { AnalyticsEvent, AnalyticsProps } from "./events";

export const initAnalytics = () => {
  const apiKey = POSTHOG_KEY;
  if (!apiKey || typeof window === "undefined") return;

  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(apiKey, {
      api_host: POSTHOG_HOST,
      autocapture: false,
      capture_pageview: false,
    });
  });
};

export const track = (event: AnalyticsEvent, props: AnalyticsProps) => {
  if (!POSTHOG_KEY || typeof window === "undefined") return;

  void import("posthog-js").then(({ default: posthog }) => {
    posthog.capture(event, props);
  });
};
