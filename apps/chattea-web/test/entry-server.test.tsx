import { PassThrough } from "node:stream";

import { afterEach, describe, expect, it, vi } from "vitest";

import { renderApp } from "@/app/entry-server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("renderApp", () => {
  it("streams the shell before the query resolves", async () => {
    vi.stubEnv("SLOW_QUERY_MS", "150");

    const writable = new PassThrough();
    const events: { t: number; text: string }[] = [];
    const t0 = performance.now();
    writable.on("data", (chunk: Buffer) => {
      events.push({ t: performance.now() - t0, text: chunk.toString("utf8") });
    });

    await renderApp(writable);

    const first = events[0];
    const titleChunk = events.find((event) =>
      event.text.includes("지금 나누는 이야기"),
    );

    expect(first).toBeDefined();
    expect(first?.t).toBeLessThan(150);
    expect(first?.text).toContain("불러오는 중");
    expect(first?.text).not.toContain("지금 나누는 이야기");
    expect(titleChunk).toBeDefined();
    expect(titleChunk?.t).toBeGreaterThanOrEqual(140);
  });

  it("invokes onShellReady before the deferred content flushes", async () => {
    vi.stubEnv("SLOW_QUERY_MS", "100");

    const writable = new PassThrough();
    let shellAt = -1;
    const t0 = performance.now();
    let titleAt = -1;
    writable.on("data", (chunk: Buffer) => {
      if (chunk.toString("utf8").includes("지금 나누는 이야기")) {
        titleAt = performance.now() - t0;
      }
    });

    await renderApp(writable, {
      onShellReady: () => {
        shellAt = performance.now() - t0;
      },
    });

    expect(shellAt).toBeGreaterThanOrEqual(0);
    expect(shellAt).toBeLessThan(titleAt);
  });
});
