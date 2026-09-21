import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const readSrc = (relativePath: string) =>
  readFileSync(path.resolve(import.meta.dirname, "..", relativePath), "utf8");

describe("daangn meetup frontend stack", () => {
  it("streams ssr with fastify and react-dom/server", () => {
    const appSource = readSrc("src/app/create-app.ts");
    const streamSource = readSrc("src/app/ssr/stream-react.ts");

    expect(appSource).toContain('from "fastify"');
    expect(streamSource).toContain('from "react-dom/server"');
    expect(streamSource).toContain("renderToPipeableStream");
  });
});
