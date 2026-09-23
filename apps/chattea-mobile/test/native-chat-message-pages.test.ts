import { describe, expect, it } from "vitest";

import type { ChatMessage } from "../src/features/chat/api";
import { mergeChatMessages } from "../src/features/chat/utils/message-pages";

const message = (id: string, createdAt: string, text = id): ChatMessage => ({
  createdAt,
  id,
  idempotencyKey: null,
  roomId: "room-1",
  senderUserId: "user-1",
  text,
});

describe("mergeChatMessages", () => {
  it("prepends an older page before the current window in ascending order", () => {
    const older = [
      message("m-1", "2026-08-01T00:00:00.000Z"),
      message("m-2", "2026-08-02T00:00:00.000Z"),
    ];
    const current = [message("m-3", "2026-08-03T00:00:00.000Z")];

    expect(mergeChatMessages(older, current).map((m) => m.id)).toEqual(["m-1", "m-2", "m-3"]);
  });

  it("dedups overlapping ids and keeps the fresher copy", () => {
    const stale = message("m-1", "2026-08-01T00:00:00.000Z", "old text");
    const fresh = message("m-1", "2026-08-01T00:00:00.000Z", "new text");

    const merged = mergeChatMessages([stale], [fresh]);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.text).toBe("new text");
  });

  it("orders messages by createdAt and id for stable pagination", () => {
    const merged = mergeChatMessages(
      [message("b", "2026-08-01T00:00:00.000Z"), message("d", "2026-08-03T00:00:00.000Z")],
      [message("a", "2026-08-01T00:00:00.000Z"), message("c", "2026-08-02T00:00:00.000Z")],
    );

    expect(merged.map((m) => m.id)).toEqual(["a", "b", "c", "d"]);
  });
});
