import type { ChatMessage } from "../api";

const compareChatMessages = (a: ChatMessage, b: ChatMessage): number =>
  a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : a.createdAt.localeCompare(b.createdAt);

export const mergeChatMessages = (...pages: ChatMessage[][]): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>();
  for (const page of pages) for (const item of page) byId.set(item.id, item);
  return [...byId.values()].sort(compareChatMessages);
};
