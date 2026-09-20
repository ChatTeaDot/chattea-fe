import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __DEV__: "true",
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
