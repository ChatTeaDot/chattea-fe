import { describe, expect, it, vi } from "vitest";

import { communityPostsQuery } from "@/pages/community";
import { API_GRAPHQL_PATH } from "@/shared/config/constants";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

describe("communityPostsQuery", () => {
  it("posts the community posts query to the same-origin proxy", async () => {
    const fetchMock = vi.fn(async () =>
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
      vi.fn(async () => new Response(JSON.stringify({ errors: [{ message: "x" }] }), { status: 200 })),
    );

    await expect(communityPostsQuery().queryFn!({} as never)).rejects.toThrow(
      "COMMUNITY_POSTS_INVALID",
    );

    vi.unstubAllGlobals();
  });
});
