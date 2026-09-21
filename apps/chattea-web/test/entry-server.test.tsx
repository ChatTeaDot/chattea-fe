import { PassThrough } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import { renderApp } from "@/app/entry-server";

describe("renderApp", () => {
  it("streams the community page html", async () => {
    const writable = new PassThrough();
    const chunks: string[] = [];
    writable.on("data", (chunk: Buffer) => {
      chunks.push(chunk.toString("utf8"));
    });

    await renderApp(writable);

    expect(chunks.join("")).toContain("<main></main>");
  });

  it("invokes onShellReady", async () => {
    const onShellReady = vi.fn();

    await renderApp(new PassThrough(), { onShellReady });

    expect(onShellReady).toHaveBeenCalledOnce();
  });
});
