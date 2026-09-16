import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { WEB_DEV_PORT } from "./src/shared/config/constants";

const config = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: true,
    port: WEB_DEV_PORT,
  },
});

export default config;
