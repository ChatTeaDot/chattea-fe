import { readFile } from "node:fs/promises";
import path from "node:path";

import middie from "@fastify/middie";
import { createServer as createViteServer } from "vite";

import { COMMUNITY_PATH, WEB_DEV_PORT } from "@/shared/config/constants";

import { createApp } from "./create-app";

const indexHtmlPath = path.resolve(import.meta.dirname, "../../index.html");

const vite = await createViteServer({
  appType: "custom",
  server: { middlewareMode: true },
});

const app = await createApp({
  loadTemplate: async () => {
    const template = await readFile(indexHtmlPath, "utf8");
    return vite.transformIndexHtml(COMMUNITY_PATH, template);
  },
  render: async (writable, options) => {
    const { renderApp } = (await vite.ssrLoadModule(
      "/src/app/entry-server.tsx",
    )) as typeof import("./entry-server");
    await renderApp(writable, options);
  },
});

await app.register(middie);
app.use(vite.middlewares);

await app.listen({ host: "0.0.0.0", port: WEB_DEV_PORT });
