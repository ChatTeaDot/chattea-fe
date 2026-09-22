import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CommunityPage } from "@/pages/community";

const renderPage = () =>
  renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(CommunityPage),
    ),
  );

describe("CommunityPage", () => {
  it("renders the sign-in state without injected auth", () => {
    vi.stubGlobal("window", {});

    const html = renderPage();

    expect(html).toContain("로그인이 필요해요");
    expect(html).toContain("글쓰기");

    vi.unstubAllGlobals();
  });
});
