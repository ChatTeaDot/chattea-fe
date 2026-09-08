import { FIRST_MESSAGE_MAX_LENGTH, MESSAGE_MAX_LENGTH } from "../constants";
import type { ChatMessageDraft, KeyFactory } from "../types";

export const hasConversationStarted = (
  serverMessageCount: number,
  sentInSession: boolean,
): boolean => serverMessageCount > 0 || sentInSession;

export const getMessageTextLimit = (hasMessages: boolean): number =>
  hasMessages ? MESSAGE_MAX_LENGTH : FIRST_MESSAGE_MAX_LENGTH;

export const normalizeMessageDraft = (input: string, limit: number): string =>
  input.trim().slice(0, limit);

export const createChatMessageDraft = (createKey: KeyFactory): ChatMessageDraft => ({
  idempotencyKey: createKey(),
  text: "",
});

export const updateChatMessageDraft = (
  current: ChatMessageDraft,
  text: string,
  limit: number,
  createKey: KeyFactory,
): ChatMessageDraft => ({
  idempotencyKey:
    normalizeMessageDraft(text, limit) === normalizeMessageDraft(current.text, limit)
      ? current.idempotencyKey
      : createKey(),
  text,
});

export const toSendChatMessageVariables = (
  roomId: string,
  draft: ChatMessageDraft,
  limit: number,
) => ({
  input: {
    idempotencyKey: draft.idempotencyKey,
    roomId,
    text: normalizeMessageDraft(draft.text, limit),
  },
});
