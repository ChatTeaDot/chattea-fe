import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

const loadProductionConfig = (override: Partial<NodeJS.ProcessEnv> = {}) => {
  const env = { ...process.env };
  env.NODE_ENV = "production";
  env.EAS_BUILD_PROFILE = "production";
  env.EXPO_PUBLIC_GRAPHQL_URL = "https://api.example.com/graphql";
  env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY = "native-app-key";
  env.EXPO_PUBLIC_DEV_REFRESH_TOKEN = "";
  env.EXPO_PUBLIC_DEV_SESSION_TOKEN = "";
  Object.assign(env, override);

  return spawnSync(
    process.execPath,
    ["-e", "process.stdout.write(JSON.stringify(require('./app.config.js')))"],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env,
    },
  );
};

const parseConfig = (override: Partial<NodeJS.ProcessEnv> = {}) => {
  const result = loadProductionConfig(override);
  expect(result.status).toBe(0);
  return JSON.parse(result.stdout) as {
    expo: {
      extra?: { eas?: { projectId?: string } };
      plugins: (string | [string, unknown])[];
    };
  };
};

describe("production app configuration", () => {
  it("accepts secure required settings", () => {
    expect(loadProductionConfig().status).toBe(0);
  });

  it("enables the native notifications plugin", () => {
    const config = parseConfig();
    const pluginNames = config.expo.plugins.flatMap((plugin) =>
      typeof plugin === "string" ? [plugin] : Array.isArray(plugin) ? [plugin[0]] : [],
    );

    expect(pluginNames).toContain("expo-notifications");
  });

  it("does not request microphone access for still-image profile selection", () => {
    const config = parseConfig();
    const imagePicker = config.expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === "expo-image-picker",
    );

    expect(imagePicker).toEqual([
      "expo-image-picker",
      expect.objectContaining({ microphonePermission: false }),
    ]);
  });

  it("exposes the configured EAS project identity", () => {
    const config = parseConfig({ EXPO_PUBLIC_EAS_PROJECT_ID: "project-id" });

    expect(config.expo.extra).toEqual({ eas: { projectId: "project-id" } });
  });

  it("keeps the EAS project identity absent when it is not configured", () => {
    const config = parseConfig({ EXPO_PUBLIC_EAS_PROJECT_ID: "" });

    expect(config.expo.extra?.eas?.projectId).toBeUndefined();
  });

  it.each([
    ["missing GraphQL URL", { EXPO_PUBLIC_GRAPHQL_URL: "" }],
    ["non-HTTPS GraphQL URL", { EXPO_PUBLIC_GRAPHQL_URL: "http://api.example.com/graphql" }],
    ["missing Kakao key", { EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY: "" }],
    ["blank Kakao key", { EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY: "   " }],
    ["development session", { EXPO_PUBLIC_DEV_SESSION_TOKEN: "header.payload.signature" }],
    ["development refresh session", { EXPO_PUBLIC_DEV_REFRESH_TOKEN: "header.payload.signature" }],
  ])("rejects %s", (_label, override) => {
    const result = loadProductionConfig(override);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("PRODUCTION_APP_CONFIG_INVALID");
  });
});
