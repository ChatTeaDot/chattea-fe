import type { Writable } from "node:stream";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { communityTitleQuery, CommunityPage } from "@/pages/community";

import { streamReact } from "./ssr/stream-react";

export const renderApp = async (writable: Writable) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(communityTitleQuery());

  await streamReact(
    <QueryClientProvider client={queryClient}>
      <CommunityPage />
    </QueryClientProvider>,
    writable,
    { end: false },
  );
};
