import path from "node:path";

import { transformAsync } from "@babel/core";
import { defineConfig, type Plugin } from "vitest/config";

const srcRoot = path.resolve(__dirname, "src");
const reactCompilerEnabled = process.env.VITEST_REACT_COMPILER !== "0";

const srcBabelTransform = (): Plugin => ({
  name: "chattea-src-babel",
  enforce: "pre",
  transform: async (code, id) => {
    const file = id.split("?")[0];
    if (!file.startsWith(`${srcRoot}/`) || !/\.[jt]sx?$/.test(file)) return null;
    const result = await transformAsync(code, {
      babelrc: false,
      configFile: false,
      filename: file,
      plugins: reactCompilerEnabled ? [["babel-plugin-react-compiler", { target: "19" }]] : [],
      presets: [
        ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
      sourceMaps: true,
    });
    return result?.code ? { code: result.code, map: result.map } : null;
  },
});

export default defineConfig({
  define: {
    __DEV__: "true",
  },
  esbuild: {
    jsx: "automatic",
  },
  plugins: [srcBabelTransform()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
