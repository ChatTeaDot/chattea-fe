import { InMemoryCache } from "@apollo/client";
import { describe, expect, it } from "vitest";

import {
  addMessageToCache,
  removeMessageFromCache,
  replaceMessageInCache,
} from "../src/features/chat/cache";
import { CHAT_MESSAGES_QUERY, getChatMessagesVariables } from "../src/features/chat/operations";

const message = {
  __typename: "ChatMessagePayload" as const,
  id: "message-1",
  roomId: "demo-room",
  text: "hi",
  createdAt: "2026-06-25T00:00:00.000Z",
};

describe("chat Apollo cache", () => {
  it("applies created, updated, optimistic, and deleted message lifecycles", () => {
    const cache = new InMemoryCache();
    const variables = getChatMessagesVariables("demo-room");
    cache.writeQuery({ query: CHAT_MESSAGES_QUERY, variables, data: { chatMessages: [message] } });

    const created = { ...message, id: "message-2", text: "new" };
    addMessageToCache(cache, "demo-room", created);
    addMessageToCache(cache, "demo-room", created);
    replaceMessageInCache(cache, "demo-room", { ...created, text: "edited" });

    expect(cache.readQuery({ query: CHAT_MESSAGES_QUERY, variables })).toEqual({
      chatMessages: [message, { ...created, text: "edited" }],
    });
    expect(cache.extract()["ChatMessagePayload:message-2"]).toMatchObject({ text: "edited" });

    const optimistic = { ...message, id: "temp-1", text: "sending" };
    const confirmed = { ...message, id: "message-3", text: "sent" };
    addMessageToCache(cache, "demo-room", optimistic);
    replaceMessageInCache(cache, "demo-room", confirmed, "temp-1");

    expect(cache.readQuery({ query: CHAT_MESSAGES_QUERY, variables })).toEqual({
      chatMessages: [message, { ...created, text: "edited" }, confirmed],
    });
    expect(cache.extract()["ChatMessagePayload:temp-1"]).toBeUndefined();

    removeMessageFromCache(cache, "message-2");

    expect(cache.readQuery({ query: CHAT_MESSAGES_QUERY, variables })).toEqual({
      chatMessages: [message, confirmed],
    });
    expect(cache.extract()["ChatMessagePayload:message-2"]).toBeUndefined();
  });
});
