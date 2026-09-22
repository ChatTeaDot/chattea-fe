import { describe, expect, it, vi } from "vitest";

import { createApp } from "@/app/create-app";
import { renderApp } from "@/app/entry-server";
import { COMMUNITY_PATH } from "@/shared/config/constants";

const TEMPLATE = `<!doctype html><html><body><div id="root"><!--app-html--></div></body></html>`;

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

describe("createApp", () => {
  it("streams community html from fastify", async () => {
    const app = await createApp({
      loadTemplate: async () => TEMPLATE,
      render: renderApp,
    });

    const response = await app.inject({
      method: "GET",
      url: COMMUNITY_PATH,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.body).toContain("<main");
    expect(response.body).toContain('<div id="root">');
    expect(response.body).not.toContain("<!--app-html-->");

    await app.close();
  });

  it("embeds primed posts and a dehydrated state script in the html", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
      ),
    );
    const app = await createApp({
      loadTemplate: async () => TEMPLATE,
      render: renderApp,
    });

    const response = await app.inject({ method: "GET", url: COMMUNITY_PATH });

    expect(response.body).toContain("첫 글");
    expect(response.body).toContain("<script>window.__DEHYDRATED__=");
    expect(response.body.indexOf("window.__DEHYDRATED__")).toBeGreaterThan(
      response.body.indexOf("</main>"),
    );
    expect(response.body.indexOf("window.__DEHYDRATED__")).toBeLessThan(
      response.body.indexOf("</body>"),
    );

    await app.close();
    vi.unstubAllGlobals();
  });

  it("forwards the request authorization header to the ssr prime fetch", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const app = await createApp({
      loadTemplate: async () => TEMPLATE,
      render: renderApp,
    });

    await app.inject({
      headers: { authorization: "Bearer forwarded" },
      method: "GET",
      url: COMMUNITY_PATH,
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer forwarded");

    await app.close();
    vi.unstubAllGlobals();
  });
});
