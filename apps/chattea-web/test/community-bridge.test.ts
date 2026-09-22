import { afterEach, describe, expect, it, vi } from "vitest";

import { requestAuthRefresh } from "@/pages/community/bridge";
import {
  COMMUNITY_AUTH_FAILED_EVENT,
  COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE,
  COMMUNITY_AUTH_REFRESH_TIMEOUT_MS,
  COMMUNITY_AUTH_REFRESHED_EVENT,
} from "@/shared/config/constants";

const stubWindow = (withBridge = true) => {
  const target = new EventTarget();
  const postMessage = vi.fn();
  const win = Object.assign(target, {
    __CHATTEA_AUTH__: { authorization: "Bearer stale" },
    ...(withBridge ? { ReactNativeWebView: { postMessage } } : {}),
  });
  vi.stubGlobal("window", win);
  return { postMessage, win };
};

describe("requestAuthRefresh", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("posts the refresh message and resolves on the refreshed event", async () => {
    const { postMessage, win } = stubWindow();

    const pending = requestAuthRefresh();

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE }),
    );
    win.dispatchEvent(new Event(COMMUNITY_AUTH_REFRESHED_EVENT));
    await expect(pending).resolves.toBe(true);
  });

  it("shares one in-flight refresh across concurrent callers", async () => {
    const { postMessage, win } = stubWindow();

    const first = requestAuthRefresh();
    const second = requestAuthRefresh();

    expect(postMessage).toHaveBeenCalledTimes(1);
    win.dispatchEvent(new Event(COMMUNITY_AUTH_REFRESHED_EVENT));
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it("resolves false when the native bridge is absent", async () => {
    stubWindow(false);

    await expect(requestAuthRefresh()).resolves.toBe(false);
  });

  it("resolves false on the failed event and allows a later retry", async () => {
    const { postMessage, win } = stubWindow();

    const pending = requestAuthRefresh();
    win.dispatchEvent(new Event(COMMUNITY_AUTH_FAILED_EVENT));
    await expect(pending).resolves.toBe(false);

    const retry = requestAuthRefresh();
    expect(postMessage).toHaveBeenCalledTimes(2);
    win.dispatchEvent(new Event(COMMUNITY_AUTH_REFRESHED_EVENT));
    await expect(retry).resolves.toBe(true);
  });

  it("resolves false when the refresh never answers", async () => {
    vi.useFakeTimers();
    stubWindow();

    const pending = requestAuthRefresh();
    await vi.advanceTimersByTimeAsync(COMMUNITY_AUTH_REFRESH_TIMEOUT_MS);

    await expect(pending).resolves.toBe(false);
  });
});
