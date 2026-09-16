import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const readSrc = (relativePath: string) =>
  readFileSync(path.resolve(import.meta.dirname, "..", relativePath), "utf8");

describe("daangn meetup frontend stack", () => {
  it("styles the community page with vanilla-extract", () => {
    const source = readSrc("src/pages/community/ui/community-page.css.ts");

    expect(source).toContain('from "@vanilla-extract/css"');
  });

  it("reads community data with tanstack query", () => {
    const source = readSrc("src/pages/community/ui/community-page.tsx");

    expect(source).toContain('from "@tanstack/react-query"');
    expect(source).toContain("useQuery");
  });

  it("streams ssr with fastify and react-dom/server", () => {
    const appSource = readSrc("src/app/create-app.ts");
    const streamSource = readSrc("src/app/ssr/stream-react.ts");

    expect(appSource).toContain('from "fastify"');
    expect(streamSource).toContain('from "react-dom/server"');
    expect(streamSource).toContain("renderToPipeableStream");
  });
});
