import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { CommunityPage } from "@/pages/community";
import {
  ANALYTICS_EVENT,
  ANALYTICS_SCREEN,
  initAnalytics,
  initDatadogRum,
  track,
} from "@/shared/analytics";

import { reportVitals } from "./report-vitals";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT_ELEMENT_MISSING");
}

const queryClient = new QueryClient();

initDatadogRum();
initAnalytics();
track(ANALYTICS_EVENT.webviewEnter, {
  screen: ANALYTICS_SCREEN.community,
  source: "webview",
});
reportVitals();

hydrateRoot(
  root,
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={window.__DEHYDRATED__}>
        <CommunityPage />
      </HydrationBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
