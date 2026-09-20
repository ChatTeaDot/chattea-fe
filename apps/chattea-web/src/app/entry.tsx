import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommunityPage } from "@/pages/community";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT_ELEMENT_MISSING");
}

const queryClient = new QueryClient();

hydrateRoot(
  root,
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CommunityPage />
    </QueryClientProvider>
  </StrictMode>,
);
