import { dehydrate, QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { primeCommunityPosts } from "@/app/ssr/prime-community-posts";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

describe("primeCommunityPosts", () => {
  it("fetches posts from the upstream endpoint and seeds the query cache", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new QueryClient();

    await primeCommunityPosts(client, "Bearer server-token");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:4000/graphql");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer server-token");
    const state = dehydrate(client);
    expect(state.queries).toHaveLength(1);
    expect(state.queries[0]?.state.data).toEqual([POST]);

    vi.unstubAllGlobals();
  });

  it("drops the query when upstream fails so ssr falls back to client fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    const client = new QueryClient();

    await primeCommunityPosts(client, undefined);

    expect(client.getQueryCache().findAll()).toHaveLength(0);

    vi.unstubAllGlobals();
  });
});
