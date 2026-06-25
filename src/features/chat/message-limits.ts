export const FIRST_MESSAGE_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 90;

export function getMessageTextLimit(hasMessages: boolean) {
  return hasMessages ? MESSAGE_MAX_LENGTH : FIRST_MESSAGE_MAX_LENGTH;
}

export function normalizeMessageDraft(input: string, limit: number) {
  return input.trim().slice(0, limit);
}
