import { describe, expect, it, vi } from "vitest";

import {
  createWebviewTrace,
  parseVitalsMessage,
  type WebviewTraceRecord,
} from "../src/features/community/utils/webview-trace";

const tags = { env: "test", release: "0.0.0-test", screen: "community" };

const createClock = (stamps: number[]) => {
  let index = 0;
  return () => {
    const value = stamps[Math.min(index, stamps.length - 1)]!;
    index += 1;
    return value;
  };
};

describe("webview trace", () => {
  it("emits one record with ordered marks and consecutive segments on close", () => {
    const emit = vi.fn<(record: WebviewTraceRecord) => void>();
    const trace = createWebviewTrace(tags, { emit, now: createClock([100, 160, 900, 1400]) });

    trace.mark("tab-focus");
    trace.mark("webview-mount");
    trace.mark("load-start");
    trace.mark("load-end");
    trace.close();

    expect(emit).toHaveBeenCalledTimes(1);
    const record = emit.mock.calls[0]![0];
    expect(record.marks).toEqual({
      "load-end": 1400,
      "load-start": 900,
      "tab-focus": 100,
      "webview-mount": 160,
    });
    expect(record.segments).toEqual({
      "load-start->load-end": 500,
      "tab-focus->webview-mount": 60,
      "webview-mount->load-start": 740,
    });
    expect(record.totalMs).toBe(1300);
    expect(record.screen).toBe("community");
    expect(record.release).toBe("0.0.0-test");
  });

  it("keeps the first timestamp for repeated marks", () => {
    const emit = vi.fn<(record: WebviewTraceRecord) => void>();
    const trace = createWebviewTrace(tags, { emit, now: createClock([10, 20, 30]) });

    trace.mark("load-start");
    trace.mark("load-start");
    trace.close();

    expect(emit.mock.calls[0]![0].marks["load-start"]).toBe(10);
  });

  it("emits only once when closed twice", () => {
    const emit = vi.fn<(record: WebviewTraceRecord) => void>();
    const trace = createWebviewTrace(tags, { emit });

    trace.mark("tab-focus");
    trace.close();
    trace.close();

    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("ignores marks added after close", () => {
    const emit = vi.fn<(record: WebviewTraceRecord) => void>();
    const trace = createWebviewTrace(tags, { emit, now: createClock([5, 50]) });

    trace.mark("tab-focus");
    trace.close();
    trace.mark("load-end");

    expect(emit.mock.calls[0]![0].marks["load-end"]).toBeUndefined();
  });
});

describe("parseVitalsMessage", () => {
  it("parses a vitals payload posted by the web page", () => {
    const raw = JSON.stringify({ name: "LCP", type: "chattea.community.vital", value: 812.4 });

    expect(parseVitalsMessage(raw)).toEqual({ name: "LCP", value: 812.4 });
  });

  it("returns null for other message types", () => {
    const raw = JSON.stringify({ name: "LCP", type: "other", value: 1 });

    expect(parseVitalsMessage(raw)).toBeNull();
  });

  it("returns null for malformed payloads", () => {
    expect(parseVitalsMessage("not-json")).toBeNull();
    expect(parseVitalsMessage(JSON.stringify({ type: "chattea.community.vital" }))).toBeNull();
    expect(
      parseVitalsMessage(
        JSON.stringify({ name: "LCP", type: "chattea.community.vital", value: "slow" }),
      ),
    ).toBeNull();
  });
});
