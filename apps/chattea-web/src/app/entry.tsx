import "@mantine/core/styles.css";

import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import { createClientI18n } from "@/i18n";
import { CommunityPage } from "@/pages/community";
import {
  ANALYTICS_EVENT,
  ANALYTICS_SCREEN,
  initAnalytics,
  initDatadogRum,
  track,
} from "@/shared/analytics";
import { AppMantineProvider } from "@/shared/ui/mantine";

import { reportVitals } from "./report-vitals";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT_ELEMENT_MISSING");
}

const queryClient = new QueryClient();
// Reuse the language resolved during SSR so the hydrated markup matches;
// when absent (module federation / direct load) detect from the browser.
const i18n = createClientI18n(window.__CHATTEA_LANG__);

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
    <AppMantineProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={window.__DEHYDRATED__}>
            <CommunityPage />
          </HydrationBoundary>
        </QueryClientProvider>
      </I18nextProvider>
    </AppMantineProvider>
  </StrictMode>,
);
