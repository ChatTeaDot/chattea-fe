import { describe, expect, it } from "vitest";

import { createApp } from "@/app/create-app";
import { renderApp } from "@/app/entry-server";
import { COMMUNITY_PATH } from "@/shared/config/constants";

const TEMPLATE = `<!doctype html><html><body><div id="root"><!--app-html--></div></body></html>`;

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
    expect(response.body).toContain("지금 나누는 이야기");
    expect(response.body).toContain('<div id="root">');
    expect(response.body).not.toContain("<!--app-html-->");

    await app.close();
  });
});
