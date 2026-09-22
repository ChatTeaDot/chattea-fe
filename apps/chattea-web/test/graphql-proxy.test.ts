import { describe, expect, it, vi } from "vitest";

import { createApp } from "@/app/create-app";
import { API_GRAPHQL_PATH } from "@/shared/config/constants";

const TEMPLATE = `<!doctype html><html><body><div id="root"><!--app-html--></div></body></html>`;

const buildApp = () =>
  createApp({
    loadTemplate: async () => TEMPLATE,
    render: async () => undefined,
  });

describe("graphql proxy", () => {
  it("forwards the query and authorization header upstream", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { communityPosts: [] } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const app = await buildApp();

    const response = await app.inject({
      headers: { authorization: "Bearer token-123" },
      method: "POST",
      payload: { query: "{ communityPosts { id } }" },
      url: API_GRAPHQL_PATH,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { communityPosts: [] } });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:4000/graphql");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer token-123");
    expect(JSON.parse(init.body as string)).toEqual({
      query: "{ communityPosts { id } }",
    });

    await app.close();
    vi.unstubAllGlobals();
  });

  it("returns 502 when the upstream is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      payload: { query: "{ communityPosts { id } }" },
      url: API_GRAPHQL_PATH,
    });

    expect(response.statusCode).toBe(502);

    await app.close();
    vi.unstubAllGlobals();
  });
});
