import type { ChatMessage, ChatMessageEvent } from "../api/schemas";
import type { ChatMessageDraft } from "../types";
import { normalizeMessageDraft } from "./message-policy";

export const OPTIMISTIC_MESSAGE_ID_PREFIX = "optimistic-";

export const isChatLiveEnabled = (appState: string, focused: boolean): boolean =>
  focused && appState === "active";

export const createOptimisticChatMessage = (
  roomId: string,
  draft: ChatMessageDraft,
  limit: number,
  senderUserId: string | null,
): ChatMessage => ({
  __typename: "ChatMessage",
  createdAt: new Date().toISOString(),
  id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}${draft.idempotencyKey}`,
  idempotencyKey: draft.idempotencyKey,
  roomId,
  senderUserId,
  text: normalizeMessageDraft(draft.text, limit),
});

export const mergeChatMessage = (existing: ChatMessage[], incoming: ChatMessage): ChatMessage[] => {
  const stale = existing.findIndex(
    (current) =>
      current.id === incoming.id ||
      (incoming.idempotencyKey !== null && current.idempotencyKey === incoming.idempotencyKey),
  );
  if (stale === -1) return [...existing, incoming];
  const next = [...existing];
  next[stale] = incoming;
  return next;
};

export type LiveChatState = {
  roomId: string | undefined;
  messages: ChatMessage[];
  deletedIds: ReadonlySet<string>;
};

export const EMPTY_LIVE_CHAT_STATE: LiveChatState = {
  roomId: undefined,
  messages: [],
  deletedIds: new Set(),
};

export const applyChatEvent = (
  state: LiveChatState,
  event: ChatMessageEvent,
  roomId: string,
): LiveChatState => {
  const base = state.roomId === roomId ? state : { ...EMPTY_LIVE_CHAT_STATE, roomId };
  const message = event.message;
  if (message.roomId !== roomId) return base;
  if (event.type === "deleted") {
    return {
      roomId,
      messages: base.messages.filter((current) => current.id !== message.id),
      deletedIds: new Set(base.deletedIds).add(message.id),
    };
  }
  return {
    roomId,
    messages: mergeChatMessage(
      base.messages.filter((current) => current.roomId === roomId),
      message,
    ),
    deletedIds: base.deletedIds,
  };
};

export const dedupeChatMessages = (messages: ChatMessage[]): ChatMessage[] => {
  const indexById = new Map<string, number>();
  const result: ChatMessage[] = [];
  for (const item of messages) {
    const index = indexById.get(item.id);
    if (index === undefined) {
      indexById.set(item.id, result.length);
      result.push(item);
    } else {
      result[index] = item;
    }
  }
  return result;
};
