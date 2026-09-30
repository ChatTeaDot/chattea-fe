// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { configureAxe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import type { AxeMatchers } from "vitest-axe/matchers";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommunityPage, communityPostsQuery } from "@/pages/community";

declare module "vitest" {
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

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

const renderPage = (client = new QueryClient()) =>
  render(createElement(QueryClientProvider, { client }, createElement(CommunityPage)));

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
