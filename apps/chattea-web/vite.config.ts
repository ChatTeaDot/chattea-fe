import path from "node:path";

import { federation } from "@module-federation/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { WEB_DEV_ORIGIN, WEB_DEV_PORT } from "./src/shared/config/constants";

const config = defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    federation({
      name: "chattea_web",
      filename: "remoteEntry.js",
      exposes: {
        "./CommunityApp": "./src/pages/community/ui/community-app.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "@tanstack/react-query": { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: true,
    origin: WEB_DEV_ORIGIN,
    port: WEB_DEV_PORT,
  },
});

export default config;
