import type { Writable } from "node:stream";

import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";

import { createI18n } from "@/i18n";
import { CommunityPage } from "@/pages/community";
import { AppMantineProvider } from "@/shared/ui/mantine";

import { primeCommunityPosts } from "./ssr/prime-community-posts";
import { streamReact } from "./ssr/stream-react";

type RenderAppOptions = {
  authorization?: string;
  language?: string;
  onShellReady?: () => void;
};

export const renderApp = async (
  writable: Writable,
  { authorization, language, onShellReady }: RenderAppOptions = {},
) => {
  const queryClient = new QueryClient();
  // A fresh i18next instance per request keeps language state isolated between
  // concurrent SSR renders.
  const i18n = createI18n(language);

  await primeCommunityPosts(queryClient, authorization);
  const state = dehydrate(queryClient);

  await streamReact(
    <AppMantineProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <CommunityPage />
        </QueryClientProvider>
      </I18nextProvider>
    </AppMantineProvider>,
    writable,
    { end: false, onShellReady },
  );

  return state;
};
