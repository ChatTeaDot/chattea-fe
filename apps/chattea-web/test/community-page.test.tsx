import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CommunityPage, communityPostsQuery } from "@/pages/community";
import { AppMantineProvider } from "@/shared/ui/mantine";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

const renderPage = (client = new QueryClient()) =>
  renderToStaticMarkup(
    createElement(
      AppMantineProvider,
      null,
      createElement(QueryClientProvider, { client }, createElement(CommunityPage)),
    ),
  );

const primedClient = () => {
  const client = new QueryClient();
  client.setQueryData(communityPostsQuery().queryKey, [POST]);
  return client;
};

describe("CommunityPage", () => {
  it("renders the sign-in state without injected auth", () => {
    vi.stubGlobal("window", {});

    const html = renderPage();

    expect(html).toContain("로그인이 필요해요");
    expect(html).toContain("글쓰기");

    vi.unstubAllGlobals();
  });

  it("renders primed posts during ssr without window auth", () => {
    const html = renderPage(primedClient());

    expect(html).toContain("첫 글");
    expect(html).toContain("<ul");
  });

  it("renders the loading state during ssr when nothing is primed", () => {
    const html = renderPage();

    expect(html).toContain("불러오는 중");
    expect(html).toContain('role="status"');
  });

  it("exposes landmark, heading, and labelled controls", () => {
    const html = renderPage(primedClient());

    expect(html).toContain("<main");
    expect(html).toContain("<h1");
    expect(html).toContain('aria-label="글쓰기"');
    expect(html).toContain("<button");
    expect(html).toContain("<li>");
  });
});
