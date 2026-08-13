import { describe, expect, it } from "vitest";

import {
  FIRST_MESSAGE_MAX_LENGTH,
  getMessageTextLimit,
  MESSAGE_MAX_LENGTH,
  normalizeMessageDraft,
} from "../src/features/chat/room/utils/message-limits";

describe("chat message limits", () => {
  it("uses product text limits for first and general messages", () => {
    expect(getMessageTextLimit(false)).toBe(FIRST_MESSAGE_MAX_LENGTH);
    expect(getMessageTextLimit(true)).toBe(MESSAGE_MAX_LENGTH);
    expect(normalizeMessageDraft(` ${"a".repeat(40)} `, FIRST_MESSAGE_MAX_LENGTH)).toHaveLength(
      FIRST_MESSAGE_MAX_LENGTH,
    );
  });
});
