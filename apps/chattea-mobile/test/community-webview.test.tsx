import { createRequire } from "node:module";

import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  COMMUNITY_VITALS_MESSAGE_TYPE,
  communityWebUrl,
  WEBVIEW_TRACE_SETTLE_MS,
  WEBVIEW_TRACE_TAG,
} from "../src/features/community/constants";

const mocks = vi.hoisted(() => ({
  webviewProps: undefined as Record<string, unknown> | undefined,
}));

vi.mock("react-native-webview", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    WebView: (props: Record<string, unknown>) => {
      mocks.webviewProps = props;
      return React.createElement("iframe", { src: (props.source as { uri: string }).uri });
    },
  };
});
vi.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (input: unknown) =>
      typeof input === "function"
        ? input(
            { colors: { background: "#fff" }, sizes: { tabBar: 0 }, spacing: { xl: 0 } },
            { insets: { bottom: 0 } },
          )
        : input,
  },
}));
vi.mock("react-native", () => ({
  Alert: { alert: vi.fn() },
}));
vi.mock("expo-crypto", () => ({
  randomUUID: () => "9d4d6a3e-7f57-4fb8-9275-ae94878316eb",
}));
vi.mock("expo-router", () => ({
  router: { back: vi.fn(), push: vi.fn() },
  useFocusEffect: (callback: () => void | (() => void)) => {
    void callback();
  },
  useLocalSearchParams: () => ({}),
  useNavigation: () => ({ addListener: () => () => undefined }),
}));
vi.mock("@apollo/client/react", () => ({
  useMutation: () => [vi.fn(), { loading: false }],
  useQuery: () => ({ data: undefined, loading: false, refetch: vi.fn() }),
}));

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

const loadTraceModule = async () => {
  const module = await import("../src/features/community/components/community-webview");
  return module.default;
};

type WebviewHandlers = {
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
};

const webview = () => mocks.webviewProps as unknown as WebviewHandlers;

const emittedRecords = (info: ReturnType<typeof vi.spyOn>) =>
  info.mock.calls
    .filter(([tag]) => tag === WEBVIEW_TRACE_TAG)
    .map(([, payload]) => JSON.parse(payload as string) as Record<string, unknown>);

describe("community webview", () => {
  afterEach(() => {
    mocks.webviewProps = undefined;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("loads the community web url", async () => {
    const CommunityWebview = await loadTraceModule();

    renderToStaticMarkup(createElement(CommunityWebview));

    expect(mocks.webviewProps?.source).toEqual({ uri: communityWebUrl });
  });

  it("emits a trace record after load end settles", async () => {
    vi.useFakeTimers();
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const CommunityWebview = await loadTraceModule();

    renderToStaticMarkup(createElement(CommunityWebview));
    webview().onLoadStart();
    webview().onLoadEnd();
    vi.advanceTimersByTime(WEBVIEW_TRACE_SETTLE_MS + 1);

    const records = emittedRecords(info);
    expect(records).toHaveLength(1);
    const marks = records[0]!.marks as Record<string, number>;
    expect(marks["tab-focus"]).toBeTypeOf("number");
    expect(marks["load-start"]).toBeTypeOf("number");
    expect(marks["load-end"]).toBeTypeOf("number");
  });

  it("records web vitals delivered through postMessage", async () => {
    vi.useFakeTimers();
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const CommunityWebview = await loadTraceModule();

    renderToStaticMarkup(createElement(CommunityWebview));
    webview().onLoadStart();
    webview().onMessage({
      nativeEvent: {
        data: JSON.stringify({ name: "FCP", type: COMMUNITY_VITALS_MESSAGE_TYPE, value: 120 }),
      },
    });
    webview().onLoadEnd();
    vi.advanceTimersByTime(WEBVIEW_TRACE_SETTLE_MS + 1);

    const records = emittedRecords(info);
    const marks = records[0]!.marks as Record<string, number>;
    expect(marks["web:FCP"]).toBeTypeOf("number");
  });

  it("closes the trace as soon as LCP arrives", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const CommunityWebview = await loadTraceModule();

    renderToStaticMarkup(createElement(CommunityWebview));
    webview().onLoadStart();
    webview().onLoadEnd();
    webview().onMessage({
      nativeEvent: {
        data: JSON.stringify({ name: "LCP", type: COMMUNITY_VITALS_MESSAGE_TYPE, value: 640 }),
      },
    });

    const records = emittedRecords(info);
    expect(records).toHaveLength(1);
    expect((records[0]!.marks as Record<string, number>)["web:LCP"]).toBeTypeOf("number");
  });
});
