import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { COMMUNITY_API_PREFIX, DEFAULT_CHATTEA_WEB_URL, SHELL_DEV_PORT } from "./src/constants";

const config = defineConfig(({ mode }) => {
  const chatteaWebUrl =
    loadEnv(mode, import.meta.dirname, "").VITE_CHATTEA_WEB_URL ?? DEFAULT_CHATTEA_WEB_URL;

  return {
    plugins: [
      react(),
      federation({
        name: "chattea_shell",
        remotes: {
          chattea_web: {
            name: "chattea_web",
            entry: `${chatteaWebUrl}/remoteEntry.js`,
            type: "module",
          },
        },
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
          "@tanstack/react-query": { singleton: true },
        },
      }),
    ],
    server: {
      host: true,
      port: SHELL_DEV_PORT,
      proxy: {
        [COMMUNITY_API_PREFIX]: {
          target: chatteaWebUrl,
          changeOrigin: true,
        },
      },
    },
  };
});

export default config;
