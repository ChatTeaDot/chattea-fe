import type { ApolloCache } from "@apollo/client";

import type { WireMessage } from "./operations";
import { CHAT_MESSAGES_QUERY, getChatMessagesVariables } from "./operations";

export const addMessageToCache = (cache: ApolloCache, roomId: string, message: WireMessage) => {
  const variables = getChatMessagesVariables(roomId);
  cache.updateQuery({ query: CHAT_MESSAGES_QUERY, variables }, (current) => {
    if (!current || current.chatMessages.some((item) => item.id === message.id)) {
      return current;
    }
    return { chatMessages: [...current.chatMessages, message] };
  });
};

export const replaceMessageInCache = (
  cache: ApolloCache,
  roomId: string,
  message: WireMessage,
  replacedId = message.id,
) => {
  const variables = getChatMessagesVariables(roomId);
  cache.updateQuery({ query: CHAT_MESSAGES_QUERY, variables }, (current) => {
    if (!current) {
      return current;
    }
    const hasReplacedId = current.chatMessages.some((item) => item.id === replacedId);
    const hasMessageId = current.chatMessages.some((item) => item.id === message.id);
    const nextMessages = current.chatMessages.flatMap((item) => {
      if (item.id === replacedId) {
        return [message];
      }
      if (item.id === message.id) {
        return hasReplacedId && replacedId !== message.id ? [] : [message];
      }
      return [item];
    });
    return {
      chatMessages: hasReplacedId || hasMessageId ? nextMessages : [...nextMessages, message],
    };
  });
  if (replacedId !== message.id) {
    cache.evict({ id: cache.identify({ __typename: "ChatMessagePayload", id: replacedId }) });
    cache.gc();
  }
};

export const removeMessageFromCache = (cache: ApolloCache, messageId: string) => {
  cache.modify({
    id: "ROOT_QUERY",
    fields: {
      chatMessages: (existingMessages, { isReference, readField }) =>
        Array.isArray(existingMessages)
          ? existingMessages.filter(
              (message) => !isReference(message) || readField("id", message) !== messageId,
            )
          : existingMessages,
    },
  });
  cache.evict({ id: cache.identify({ __typename: "ChatMessagePayload", id: messageId }) });
  cache.gc();
};
