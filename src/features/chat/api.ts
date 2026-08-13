import { apolloClient } from "@/shared/graphql";

import { removeMessageFromCache, replaceMessageInCache } from "./cache";
import type {
  CreateUploadInput,
  EditMessageInput,
  ReportMessageInput,
  SendMessageInput,
  UnreadMessageSummaryInput,
  WireMessage,
} from "./operations";
import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  CREATE_UPLOAD_MUTATION,
  DELETE_CHAT_MESSAGE_MUTATION,
  EDIT_CHAT_MESSAGE_MUTATION,
  getChatMessagesVariables,
  MARK_CHAT_ROOM_READ_MUTATION,
  REPORT_CHAT_MESSAGE_MUTATION,
  SEND_CHAT_MESSAGE_MUTATION,
  SET_CHAT_TYPING_MUTATION,
  UNREAD_MESSAGE_SUMMARY_QUERY,
} from "./operations";
import type { AiSummaryPreview, Message, Room, Upload } from "./types";

type Fetcher = typeof fetch;

let uploadFetch: Fetcher = fetch;

export const setUploadFetcher = (fetcher: Fetcher) => {
  uploadFetch = fetcher;
};

export const formatReceivedMessage = (message: WireMessage): Message => ({
  id: message.id,
  roomId: message.roomId,
  text: message.text,
  createdAt: message.createdAt,
  status: "sent",
  mine: false,
});

export const formatSentMessage = (message: WireMessage): Message => ({
  ...formatReceivedMessage(message),
  mine: true,
});

export const listRooms = async (): Promise<Room[]> => {
  const { data } = await apolloClient.query({ query: CHAT_ROOMS_QUERY });
  if (!data) {
    throw new Error("CHAT_ROOMS_EMPTY_RESPONSE");
  }
  return data.chatRooms;
};

export const getUnreadMessageSummary = async (
  input: UnreadMessageSummaryInput,
): Promise<AiSummaryPreview> => {
  const { data } = await apolloClient.query({
    query: UNREAD_MESSAGE_SUMMARY_QUERY,
    variables: { input },
    fetchPolicy: "network-only",
  });
  if (!data) {
    throw new Error("UNREAD_MESSAGE_SUMMARY_EMPTY_RESPONSE");
  }
  return data.unreadMessageSummary;
};

export const listMessages = async (
  roomId: string,
  input: { readonly first?: number; readonly after?: string | null } = {},
): Promise<Message[]> => {
  const { data } = await apolloClient.query({
    query: CHAT_MESSAGES_QUERY,
    variables: getChatMessagesVariables(roomId, input),
  });
  if (!data) {
    throw new Error("CHAT_MESSAGES_EMPTY_RESPONSE");
  }
  return data.chatMessages.map(formatReceivedMessage);
};

export const sendMessage = async (input: SendMessageInput): Promise<Message> => {
  const { data } = await apolloClient.mutate({
    mutation: SEND_CHAT_MESSAGE_MUTATION,
    variables: { input },
  });
  if (!data) {
    throw new Error("SEND_CHAT_MESSAGE_EMPTY_RESPONSE");
  }
  replaceMessageInCache(
    apolloClient.cache,
    input.roomId,
    data.sendChatMessage,
    input.idempotencyKey,
  );
  return formatSentMessage(data.sendChatMessage);
};

export const editMessage = async (input: EditMessageInput): Promise<Message> => {
  const { data } = await apolloClient.mutate({
    mutation: EDIT_CHAT_MESSAGE_MUTATION,
    variables: { input },
  });
  if (!data) {
    throw new Error("EDIT_CHAT_MESSAGE_EMPTY_RESPONSE");
  }
  replaceMessageInCache(apolloClient.cache, data.editChatMessage.roomId, data.editChatMessage);
  return formatSentMessage(data.editChatMessage);
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const { data } = await apolloClient.mutate({
    mutation: DELETE_CHAT_MESSAGE_MUTATION,
    variables: { messageId },
  });
  const deleted = data?.deleteChatMessage ?? false;
  if (deleted) {
    removeMessageFromCache(apolloClient.cache, messageId);
  }
  return deleted;
};

export const markRoomRead = async (roomId: string): Promise<boolean> => {
  const { data } = await apolloClient.mutate({
    mutation: MARK_CHAT_ROOM_READ_MUTATION,
    variables: { input: { roomId } },
  });
  return data?.markChatRoomRead ?? false;
};

export const setTyping = async (input: {
  readonly roomId: string;
  readonly typing: boolean;
}): Promise<boolean> => {
  const { data } = await apolloClient.mutate({
    mutation: SET_CHAT_TYPING_MUTATION,
    variables: { input },
  });
  return data?.setChatTyping ?? false;
};

export const reportMessage = async (input: ReportMessageInput): Promise<boolean> => {
  const { data } = await apolloClient.mutate({
    mutation: REPORT_CHAT_MESSAGE_MUTATION,
    variables: { input },
  });
  return data?.reportChatMessage ?? false;
};

export const createUpload = async (input: CreateUploadInput): Promise<Upload> => {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_UPLOAD_MUTATION,
    variables: { input },
  });
  if (!data) {
    throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");
  }
  return data.createUpload;
};

export const uploadFileToSignedUrl = async (input: {
  readonly putUrl: string;
  readonly contentType: string;
  readonly body: Blob | ArrayBuffer | string;
}) => {
  const response = await uploadFetch(input.putUrl, {
    method: "PUT",
    headers: { "content-type": input.contentType },
    body: input.body,
  });
  if (!response.ok) {
    throw new Error("UPLOAD_PUT_FAILED");
  }
};
