import type { Writable } from "node:stream";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommunityPage } from "@/pages/community";

import { streamReact } from "./ssr/stream-react";

type RenderAppOptions = {
  onShellReady?: () => void;
};

export const renderApp = async (writable: Writable, { onShellReady }: RenderAppOptions = {}) => {
  const queryClient = new QueryClient();

  await streamReact(
    <QueryClientProvider client={queryClient}>
      <CommunityPage />
    </QueryClientProvider>,
    writable,
    { end: false, onShellReady },
  );
};
