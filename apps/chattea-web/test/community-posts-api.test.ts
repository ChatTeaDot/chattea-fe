import { afterEach, describe, expect, it, vi } from "vitest";

import { communityPostsQuery } from "@/pages/community";
import {
  API_GRAPHQL_PATH,
  COMMUNITY_AUTH_FAILED_EVENT,
  COMMUNITY_AUTH_REFRESHED_EVENT,
} from "@/shared/config/constants";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

const stubBridgeWindow = () => {
  const target = new EventTarget();
  const postMessage = vi.fn();
  const win = Object.assign(target, {
    __CHATTEA_AUTH__: { authorization: "Bearer stale" },
    ReactNativeWebView: { postMessage },
  });
  vi.stubGlobal("window", win);
  return { postMessage, win };
};

describe("communityPostsQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the community posts query to the same-origin proxy", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { __CHATTEA_AUTH__: { authorization: "Bearer abc" } });

    const posts = await communityPostsQuery().queryFn!({} as never);

    expect(posts).toEqual([POST]);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(API_GRAPHQL_PATH);
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer abc");

    vi.unstubAllGlobals();
  });

  it("throws when the response has no posts payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify({ errors: [{ message: "x" }] }), { status: 200 }),
      ),
    );

    await expect(communityPostsQuery().queryFn!({} as never)).rejects.toThrow(
      "COMMUNITY_POSTS_INVALID",
    );

    vi.unstubAllGlobals();
  });

  it("refreshes native auth and retries once on 401", async () => {
    const { postMessage, win } = stubBridgeWindow();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("unauthorized", { status: 401 }))
      .mockImplementation(
        async () =>
          new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const pending = communityPostsQuery().queryFn!({} as never);
    await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    win.__CHATTEA_AUTH__ = { authorization: "Bearer fresh" };
    win.dispatchEvent(new Event(COMMUNITY_AUTH_REFRESHED_EVENT));

    await expect(pending).resolves.toEqual([POST]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, retryInit] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect((retryInit.headers as Record<string, string>).authorization).toBe("Bearer fresh");
  });

  it("does not retry when native refresh fails", async () => {
    const { postMessage, win } = stubBridgeWindow();
    const fetchMock = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const pending = communityPostsQuery().queryFn!({} as never);
    await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    win.dispatchEvent(new Event(COMMUNITY_AUTH_FAILED_EVENT));

    await expect(pending).rejects.toThrow("COMMUNITY_POSTS_401");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
