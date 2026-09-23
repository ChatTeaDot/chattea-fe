import { PassThrough } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import { renderApp } from "@/app/entry-server";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

const collectRender = async (options?: Parameters<typeof renderApp>[1]) => {
  const writable = new PassThrough();
  const chunks: string[] = [];
  writable.on("data", (chunk: Buffer) => {
    chunks.push(chunk.toString("utf8"));
  });
  const state = await renderApp(writable, options);
  return { body: chunks.join(""), state };
};

describe("renderApp", () => {
  it("streams the community page html", async () => {
    const { body } = await collectRender();

    expect(body).toContain("<main");
  });

  it("invokes onShellReady", async () => {
    const onShellReady = vi.fn();

    await renderApp(new PassThrough(), { onShellReady });

    expect(onShellReady).toHaveBeenCalledOnce();
  });

  it("renders primed posts into the stream and returns dehydrated state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ data: { communityPosts: [POST] } }), { status: 200 }),
      ),
    );

    const { body, state } = await collectRender({ authorization: "Bearer server-token" });

    expect(body).toContain("첫 글");
    expect(body).toContain("<ul");
    expect(state?.queries).toHaveLength(1);

    vi.unstubAllGlobals();
  });

  it("streams the loading state and empty state when upstream fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );

    const { body, state } = await collectRender();

    expect(body).toContain("불러오는 중");
    expect(state?.queries).toHaveLength(0);

    vi.unstubAllGlobals();
  });
});
