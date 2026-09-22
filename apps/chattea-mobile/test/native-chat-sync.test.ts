import { afterEach, describe, expect, it, vi } from "vitest";

import type { ChatMessage } from "../src/features/chat/api/schemas";
import {
  createOptimisticChatMessage,
  dedupeChatMessages,
  isChatPollingEnabled,
  mergeChatMessage,
  OPTIMISTIC_MESSAGE_ID_PREFIX,
} from "../src/features/chat/utils/message-sync";

const message = (partial: Partial<ChatMessage>): ChatMessage => ({
  createdAt: "2026-09-22T00:00:00.000Z",
  id: "m-1",
  idempotencyKey: null,
  roomId: "room-1",
  senderUserId: "user-1",
  text: "안녕",
  ...partial,
});

describe("native chat sync", () => {
  it("builds an optimistic message with a temp id and normalized text", () => {
    const optimistic = createOptimisticChatMessage(
      "room-1",
      { idempotencyKey: "key-1", text: "  안녕하세요  " },
      90,
      "user-1",
    );

    expect(optimistic.id).toBe(`${OPTIMISTIC_MESSAGE_ID_PREFIX}key-1`);
    expect(optimistic.roomId).toBe("room-1");
    expect(optimistic.senderUserId).toBe("user-1");
    expect(optimistic.text).toBe("안녕하세요");
    expect(optimistic.idempotencyKey).toBe("key-1");
    expect(Number.isNaN(Date.parse(optimistic.createdAt))).toBe(false);
  });

  it("appends a new server message at the end", () => {
    const existing = [message({ id: "m-1" })];
    const merged = mergeChatMessage(existing, message({ id: "m-2" }));

    expect(merged.map((m) => m.id)).toEqual(["m-1", "m-2"]);
  });

  it("replaces the optimistic temp message when the echo shares its idempotency key", () => {
    const existing = [
      message({ id: "m-1" }),
      message({ id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}key-9`, idempotencyKey: "key-9" }),
    ];
    const merged = mergeChatMessage(
      existing,
      message({ id: "real-9", idempotencyKey: "key-9", text: "확인" }),
    );

    expect(merged.map((m) => m.id)).toEqual(["m-1", "real-9"]);
    expect(merged[1]?.text).toBe("확인");
  });

  it("dedupes a redelivered message by id", () => {
    const existing = [message({ id: "m-1" }), message({ id: "m-2" })];
    const merged = mergeChatMessage(existing, message({ id: "m-1", text: "수정" }));

    expect(merged.map((m) => m.id)).toEqual(["m-1", "m-2"]);
    expect(merged[0]?.text).toBe("수정");
  });

  it("dedupes a polled list by id keeping the last copy", () => {
    const list = [
      message({ id: "m-1", text: "old" }),
      message({ id: "m-2" }),
      message({ id: "m-1", text: "new" }),
    ];

    expect(dedupeChatMessages(list).map((m) => `${m.id}:${m.text}`)).toEqual([
      "m-1:new",
      "m-2:안녕",
    ]);
  });

  it("enables polling only while the app is active and the screen is focused", () => {
    expect(isChatPollingEnabled("active", true)).toBe(true);
    expect(isChatPollingEnabled("active", false)).toBe(false);
    expect(isChatPollingEnabled("background", true)).toBe(false);
    expect(isChatPollingEnabled("inactive", true)).toBe(false);
  });
});

describe("send-to-bubble latency with a mocked round trip", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the bubble immediately instead of after the mutation round trip", async () => {
    vi.useFakeTimers();
    const RTT_MS = 250;
    const echo = message({ id: "real-1", idempotencyKey: "key-1" });

    const beforeStart = Date.now();
    let beforeList: ChatMessage[] = [];
    const beforeSend = new Promise<ChatMessage>((resolve) =>
      setTimeout(() => resolve(echo), RTT_MS),
    ).then((server) => {
      beforeList = mergeChatMessage(beforeList, server);
      return server;
    });
    await vi.advanceTimersByTimeAsync(RTT_MS);
    await beforeSend;
    const beforeMs = Date.now() - beforeStart;
    expect(beforeList.map((m) => m.id)).toEqual(["real-1"]);

    const afterStart = Date.now();
    const optimistic = createOptimisticChatMessage(
      "room-1",
      { idempotencyKey: "key-1", text: "안녕" },
      90,
      "user-1",
    );
    const afterList = mergeChatMessage([], optimistic);
    const afterMs = Date.now() - afterStart;

    expect(afterList).toHaveLength(1);
    expect(beforeMs).toBe(RTT_MS);
    expect(afterMs).toBe(0);
  });
});
