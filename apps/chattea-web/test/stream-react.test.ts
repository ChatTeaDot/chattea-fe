import { PassThrough } from "node:stream";

import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { streamReact } from "@/app/ssr/stream-react";

const collectStream = async (end: boolean) => {
  const writable = new PassThrough();
  const chunks: Buffer[] = [];
  writable.on("data", (chunk: Buffer | string) => {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  });
  const finished = new Promise<void>((resolve, reject) => {
    writable.on("finish", () => resolve());
    writable.on("error", reject);
  });

  await streamReact(createElement("h1", null, "지금 나누는 이야기"), writable, { end });

  if (end) {
    await finished;
  }

  return { body: Buffer.concat(chunks).toString("utf8"), writable };
};

describe("streamReact", () => {
  it("streams markup through renderToPipeableStream", async () => {
    const { body } = await collectStream(true);

    expect(body).toContain("<h1");
    expect(body).toContain("지금 나누는 이야기");
  });

  it("can keep the destination open for surrounding html", async () => {
    const { writable } = await collectStream(false);

    expect(writable.writableEnded).toBe(false);
    writable.end();
  });
});
