import type { Message } from "../../types";

export const reconcileMessages = (
  serverMessages: readonly Message[],
  localMessages: readonly Message[],
) => {
  const messagesById = new Map(serverMessages.map((message) => [message.id, message]));
  localMessages.forEach((message) => messagesById.set(message.id, message));
  return [...messagesById.values()];
};
