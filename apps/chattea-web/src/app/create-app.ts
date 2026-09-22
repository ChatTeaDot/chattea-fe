import type { Writable } from "node:stream";

import fastify, { type FastifyInstance } from "fastify";

import { COMMUNITY_PATH } from "@/shared/config/constants";

import { registerGraphqlProxy } from "./graphql-proxy";
import { createVitalsStore, registerVitalsRoutes } from "./vitals";

type RenderOptions = {
  onShellReady?: () => void;
};

type CreateAppOptions = {
  loadTemplate: () => Promise<string>;
  render: (writable: Writable, options?: RenderOptions) => Promise<void>;
};

export const createApp = async ({
  loadTemplate,
  render,
}: CreateAppOptions): Promise<FastifyInstance> => {
  const app = fastify();
  const template = await loadTemplate();
  const [head, tail = ""] = template.split("<!--app-html-->");

  app.get(COMMUNITY_PATH, async (_request, reply) => {
    reply.hijack();
    const startedAt = performance.now();
    reply.raw.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      trailer: "server-timing",
    });
    reply.raw.write(head);
    let shellMs = 0;
    await render(reply.raw, {
      onShellReady: () => {
        shellMs = performance.now() - startedAt;
      },
    });
    if (typeof reply.raw.addTrailers === "function") {
      reply.raw.addTrailers({
        "server-timing": `shell;dur=${shellMs.toFixed(1)}`,
      });
    }
    reply.raw.end(tail);
  });

  registerGraphqlProxy(app);
  registerVitalsRoutes(app, createVitalsStore());

  return app;
};
