import type { Writable } from "node:stream";

import fastify, { type FastifyInstance } from "fastify";

import { COMMUNITY_PATH } from "@/shared/config/constants";

import { createVitalsStore, registerVitalsRoutes } from "./vitals";

type CreateAppOptions = {
  loadTemplate: () => Promise<string>;
  render: (writable: Writable) => Promise<void>;
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
    reply.raw.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    reply.raw.write(head);
    await render(reply.raw);
    reply.raw.end(tail);
  });

  registerVitalsRoutes(app, createVitalsStore());

  return app;
};
