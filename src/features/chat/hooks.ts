import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import type { MutationCallbacks } from "@/shared/graphql";
import { settleMutation } from "@/shared/graphql";

import { formatReceivedMessage, formatSentMessage } from "./api";
import { replaceMessageInCache } from "./cache";
import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  getChatMessagesQueryOptions,
  MARK_CHAT_ROOM_READ_MUTATION,
  REPORT_CHAT_MESSAGE_MUTATION,
  SEND_CHAT_MESSAGE_MUTATION,
  SET_CHAT_TYPING_MUTATION,
  UNREAD_MESSAGE_SUMMARY_QUERY,
} from "./operations";
import type { AiSummaryPreview, Message } from "./types";

export const useRooms = () => {
  const query = useQuery(CHAT_ROOMS_QUERY);
  return { ...query, data: query.data?.chatRooms };
};

export const useUnreadMessageSummary = () => {
  const client = useApolloClient();
  const execute = useCallback(
    async (input: { planId: string; unreadTexts: string[]; enabled: boolean }) => {
      const { data } = await client.query({
        query: UNREAD_MESSAGE_SUMMARY_QUERY,
        variables: { input },
        fetchPolicy: "network-only",
      });
      if (!data) {
        throw new Error("UNREAD_MESSAGE_SUMMARY_EMPTY_RESPONSE");
      }
      return data.unreadMessageSummary;
    },
    [client],
  );
  const mutate = useCallback(
    (
      input: { planId: string; unreadTexts: string[]; enabled: boolean },
      callbacks?: MutationCallbacks<AiSummaryPreview>,
    ) => {
      void settleMutation(execute(input), callbacks);
    },
    [execute],
  );
  return { mutate, mutateAsync: execute };
};

export const useMessages = (roomId: string) => {
  const options = useMemo(() => getChatMessagesQueryOptions(roomId), [roomId]);
  const query = useQuery(CHAT_MESSAGES_QUERY, options);

  return {
    ...query,
    data: query.data?.chatMessages.map(formatReceivedMessage),
  };
};

export const useSendMessage = (roomId: string) => {
  const [runMutation, result] = useMutation(SEND_CHAT_MESSAGE_MUTATION);
  const execute = useCallback(
    async (input: { roomId: string; text: string; idempotencyKey: string }) => {
      const { data } = await runMutation({
        variables: { input },
        optimisticResponse: {
          sendChatMessage: {
            __typename: "ChatMessagePayload",
            id: input.idempotencyKey,
            roomId: input.roomId,
            text: input.text,
            createdAt: new Date().toISOString(),
          },
        },
        update: (cache, mutationResult) => {
          const message = mutationResult.data?.sendChatMessage;
          if (!message) {
            return;
          }
          replaceMessageInCache(cache, roomId, message, input.idempotencyKey);
        },
      });
      if (!data) {
        throw new Error("SEND_CHAT_MESSAGE_EMPTY_RESPONSE");
      }
      return formatSentMessage(data.sendChatMessage);
    },
    [roomId, runMutation],
  );
  const mutate = useCallback(
    (
      input: { roomId: string; text: string; idempotencyKey: string },
      callbacks?: MutationCallbacks<Message>,
    ) => {
      void settleMutation(execute(input), callbacks);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useMarkRoomRead = () => {
  const [runMutation, result] = useMutation(MARK_CHAT_ROOM_READ_MUTATION);
  const execute = useCallback(
    async (roomId: string) => {
      const { data } = await runMutation({ variables: { input: { roomId } } });
      return data?.markChatRoomRead ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (roomId: string, callbacks?: MutationCallbacks<boolean>) => {
      void settleMutation(execute(roomId), callbacks);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useSetTyping = () => {
  const [runMutation, result] = useMutation(SET_CHAT_TYPING_MUTATION);
  const execute = useCallback(
    async (input: { roomId: string; typing: boolean }) => {
      const { data } = await runMutation({ variables: { input } });
      return data?.setChatTyping ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (input: { roomId: string; typing: boolean }, callbacks?: MutationCallbacks<boolean>) => {
      void settleMutation(execute(input), callbacks);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useReportMessage = () => {
  const [runMutation, result] = useMutation(REPORT_CHAT_MESSAGE_MUTATION);
  const execute = useCallback(
    async (input: { messageId: string; reason: string }) => {
      const { data } = await runMutation({ variables: { input } });
      return data?.reportChatMessage ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (input: { messageId: string; reason: string }, callbacks?: MutationCallbacks<boolean>) => {
      void settleMutation(execute(input), callbacks);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export { useRoomRealtime } from "./realtime";
