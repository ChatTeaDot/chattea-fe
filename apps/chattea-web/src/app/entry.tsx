import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommunityPage } from "@/pages/community";

import { reportVitals } from "./report-vitals";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT_ELEMENT_MISSING");
}

const queryClient = new QueryClient();

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
