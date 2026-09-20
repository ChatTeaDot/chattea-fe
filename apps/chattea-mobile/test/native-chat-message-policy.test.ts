import { describe, expect, it } from "vitest";

import { FIRST_MESSAGE_MAX_LENGTH, MESSAGE_MAX_LENGTH } from "../src/features/chat/constants";
import {
  createChatMessageDraft,
  getMessageTextLimit,
  hasConversationStarted,
  normalizeMessageDraft,
  toSendChatMessageVariables,
  updateChatMessageDraft,
} from "../src/features/chat/utils/message-policy";

describe("native chat message policy", () => {
  it("limits the first message to 30 characters and later messages to 90", () => {
    expect(getMessageTextLimit(hasConversationStarted(0, false))).toBe(FIRST_MESSAGE_MAX_LENGTH);
    expect(FIRST_MESSAGE_MAX_LENGTH).toBe(30);
    expect(getMessageTextLimit(hasConversationStarted(1, false))).toBe(MESSAGE_MAX_LENGTH);
    expect(getMessageTextLimit(hasConversationStarted(0, true))).toBe(MESSAGE_MAX_LENGTH);
    expect(MESSAGE_MAX_LENGTH).toBe(90);
  });

  it("normalizes the outgoing message with the active limit", () => {
    expect(normalizeMessageDraft(` ${"a".repeat(40)} `, FIRST_MESSAGE_MAX_LENGTH)).toBe(
      "a".repeat(30),
    );
    expect(normalizeMessageDraft(` ${"b".repeat(100)} `, MESSAGE_MAX_LENGTH)).toBe("b".repeat(90));
  });

  it("keeps one idempotency key for equivalent retries and rotates it with the payload", () => {
    const keys = ["message-key-1", "message-key-2", "message-key-3"];
    const createKey = () => keys.shift() ?? "unexpected-key";
    let draft = createChatMessageDraft(createKey);
    draft = updateChatMessageDraft(draft, " 안녕하세요 ", FIRST_MESSAGE_MAX_LENGTH, createKey);
    const submittedKey = draft.idempotencyKey;

    const equivalent = updateChatMessageDraft(
      draft,
      "안녕하세요",
      FIRST_MESSAGE_MAX_LENGTH,
      createKey,
    );

    expect(equivalent.idempotencyKey).toBe(submittedKey);
    expect(toSendChatMessageVariables("room-1", equivalent, FIRST_MESSAGE_MAX_LENGTH)).toEqual({
      input: {
        idempotencyKey: submittedKey,
        roomId: "room-1",
        text: "안녕하세요",
      },
    });
    expect(
      updateChatMessageDraft(equivalent, "다른 메시지", FIRST_MESSAGE_MAX_LENGTH, createKey)
        .idempotencyKey,
    ).not.toBe(submittedKey);
    expect(createChatMessageDraft(createKey).idempotencyKey).not.toBe(submittedKey);
  });
});
