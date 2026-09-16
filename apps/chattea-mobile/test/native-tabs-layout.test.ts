import { createRequire } from "node:module";

import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import TabsLayout from "../src/app/(tabs)/_layout";

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

vi.mock("expo-router/unstable-native-tabs", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const Trigger = Object.assign(
    ({ children, name }: { children?: ReactNode; name: string }) =>
      React.createElement("section", { "data-tab": name }, children),
    {
      Badge: ({ children }: { children?: ReactNode }) =>
        React.createElement("mark", { "data-tab-badge": true }, children),
      Icon: () => React.createElement("span"),
      Label: ({ children }: { children?: ReactNode }) =>
        React.createElement("span", null, children),
    },
  );
  return {
    NativeTabs: Object.assign(
      ({ children }: { children?: ReactNode }) => React.createElement("nav", null, children),
      { Trigger },
    ),
  };
});
vi.mock("react-native-unistyles", () => ({
  useUnistyles: () => ({
    theme: {
      colors: { muted: "#000", primary: "#111", transparent: "transparent" },
    },
  }),
}));

describe("native tabs", () => {
  it("renders the likes tab without a badge", () => {
    const markup = renderToStaticMarkup(createElement(TabsLayout));

    expect(markup).toContain('data-tab="likes"');
    expect(markup).not.toContain("data-tab-badge");
  });
});
