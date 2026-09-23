import type { Writable } from "node:stream";

import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommunityPage } from "@/pages/community";

import { primeCommunityPosts } from "./ssr/prime-community-posts";
import { streamReact } from "./ssr/stream-react";

type RenderAppOptions = {
  authorization?: string;
  onShellReady?: () => void;
};

export const renderApp = async (
  writable: Writable,
  { authorization, onShellReady }: RenderAppOptions = {},
) => {
  const queryClient = new QueryClient();

  await primeCommunityPosts(queryClient, authorization);
  const state = dehydrate(queryClient);

  await streamReact(
    <QueryClientProvider client={queryClient}>
      <CommunityPage />
    </QueryClientProvider>,
    writable,
    { end: false, onShellReady },
  );

  return state;
};
