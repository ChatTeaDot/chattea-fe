// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configureAxe } from "vitest-axe";
import type { AxeMatchers } from "vitest-axe/matchers";
import * as axeMatchers from "vitest-axe/matchers";

import { createI18n } from "@/i18n";
import { CommunityPage, communityPostsQuery } from "@/pages/community";
import { AppMantineProvider } from "@/shared/ui/mantine";

declare module "vitest" {
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

// jsdom lacks matchMedia; Mantine's color-scheme manager calls it on render.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }) as MediaQueryList;
}

const axe = configureAxe({
  rules: { "color-contrast": { enabled: false } },
});

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

// Fixed ko instance keeps assertions deterministic — the default browser
// instance resolves asynchronously through the language detector.
const renderPage = (client = new QueryClient()) =>
  render(
    createElement(
      AppMantineProvider,
      null,
      createElement(
        I18nextProvider,
        { i18n: createI18n("ko") },
        createElement(QueryClientProvider, { client }, createElement(CommunityPage)),
      ),
    ),
  );

const primedClient = () => {
  const client = new QueryClient();
  client.setQueryData(communityPostsQuery().queryKey, [POST]);
  return client;
};

const signedIn = () => {
  window.__CHATTEA_AUTH__ = { authorization: "Bearer test-token" };
};

afterEach(() => {
  cleanup();
  delete window.__CHATTEA_AUTH__;
  vi.unstubAllGlobals();
});

describe("CommunityPage accessibility", () => {
  it("has no axe violations in the sign-in state", async () => {
    const { container } = renderPage();

    expect(screen.getByText("로그인이 필요해요")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the post list state", async () => {
    signedIn();

    const { container } = renderPage(primedClient());

    expect(screen.getByText("첫 글")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the error state", async () => {
    signedIn();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("nope", { status: 500 }))),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { container } = renderPage(client);

    await screen.findByText("목록을 불러오지 못했어요");
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});
