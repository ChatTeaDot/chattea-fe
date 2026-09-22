import type { ChatMessage } from "../api/schemas";
import type { ChatMessageDraft } from "../types";
import { normalizeMessageDraft } from "./message-policy";

export const OPTIMISTIC_MESSAGE_ID_PREFIX = "optimistic-";

export const isChatPollingEnabled = (appState: string, focused: boolean): boolean =>
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
