import { describe, expect, it } from "vitest";

import { useRoomRealtime } from "../src/features/chat/realtime";

describe("chat realtime fallback", () => {
  it("returns stable unavailable state without backend subscription support", () => {
    const first = useRoomRealtime("room-1");
    const second = useRoomRealtime("room-2");

    expect(first).toBe(second);
    expect(first).toEqual({ isPeerTyping: false, readReceiptVersion: 0 });
  });
});
