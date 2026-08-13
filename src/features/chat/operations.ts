import { gql, type TypedDocumentNode } from "@apollo/client";

import type { AiSummaryPreview, Message, Room, Upload } from "./types";

export type WireMessage = Omit<Message, "status" | "mine"> & {
  readonly __typename?: "ChatMessagePayload";
};

export type ChatMessagesInput = {
  readonly roomId: string;
  readonly first: number;
  readonly after: string | null;
};

export type SendMessageInput = {
  readonly roomId: string;
  readonly text: string;
  readonly idempotencyKey: string;
};

export type EditMessageInput = {
  readonly messageId: string;
  readonly text: string;
};

export type UnreadMessageSummaryInput = {
  readonly planId: string;
  readonly unreadTexts: readonly string[];
  readonly enabled: boolean;
};

export type ReportMessageInput = {
  readonly messageId: string;
  readonly reason: string;
};

export type CreateUploadInput = {
  readonly filename: string;
  readonly contentType: string;
};

export const CHAT_MESSAGES_POLL_INTERVAL = 5_000;

export const CHAT_ROOMS_QUERY: TypedDocumentNode<{ chatRooms: Room[] }> = gql`
  query ChatRooms {
    chatRooms {
      __typename
      id
      name
      lastMessage
    }
  }
`;

export const UNREAD_MESSAGE_SUMMARY_QUERY: TypedDocumentNode<
  { unreadMessageSummary: AiSummaryPreview },
  { input: UnreadMessageSummaryInput }
> = gql`
  query UnreadMessageSummary($input: UnreadMessageSummaryInput!) {
    unreadMessageSummary(input: $input) {
      __typename
      available
      reason
      sourceText
      summary
    }
  }
`;

export const CHAT_MESSAGES_QUERY: TypedDocumentNode<
  { chatMessages: WireMessage[] },
  { input: ChatMessagesInput }
> = gql`
  query ChatMessages($input: ChatMessagesInput!) {
    chatMessages(input: $input) {
      __typename
      id
      roomId
      text
      createdAt
    }
  }
`;

export const SEND_CHAT_MESSAGE_MUTATION: TypedDocumentNode<
  { sendChatMessage: WireMessage },
  { input: SendMessageInput }
> = gql`
  mutation SendChatMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      __typename
      id
      roomId
      text
      createdAt
    }
  }
`;

export const EDIT_CHAT_MESSAGE_MUTATION: TypedDocumentNode<
  { editChatMessage: WireMessage },
  { input: EditMessageInput }
> = gql`
  mutation EditChatMessage($input: EditChatMessageInput!) {
    editChatMessage(input: $input) {
      __typename
      id
      roomId
      text
      createdAt
    }
  }
`;

export const DELETE_CHAT_MESSAGE_MUTATION: TypedDocumentNode<
  { deleteChatMessage: boolean },
  { messageId: string }
> = gql`
  mutation DeleteChatMessage($messageId: String!) {
    deleteChatMessage(messageId: $messageId)
  }
`;

export const MARK_CHAT_ROOM_READ_MUTATION: TypedDocumentNode<
  { markChatRoomRead: boolean },
  { input: { roomId: string } }
> = gql`
  mutation MarkChatRoomRead($input: MarkRoomReadInput!) {
    markChatRoomRead(input: $input)
  }
`;

export const SET_CHAT_TYPING_MUTATION: TypedDocumentNode<
  { setChatTyping: boolean },
  { input: { roomId: string; typing: boolean } }
> = gql`
  mutation SetChatTyping($input: SetTypingInput!) {
    setChatTyping(input: $input)
  }
`;

export const REPORT_CHAT_MESSAGE_MUTATION: TypedDocumentNode<
  { reportChatMessage: boolean },
  { input: ReportMessageInput }
> = gql`
  mutation ReportChatMessage($input: ReportMessageInput!) {
    reportChatMessage(input: $input)
  }
`;

export const CREATE_UPLOAD_MUTATION: TypedDocumentNode<
  { createUpload: Upload },
  { input: CreateUploadInput }
> = gql`
  mutation CreateUpload($input: CreateUploadInput!) {
    createUpload(input: $input) {
      __typename
      id
      putUrl
    }
  }
`;

export const getChatMessagesVariables = (
  roomId: string,
  input: { readonly first?: number; readonly after?: string | null } = {},
): { input: ChatMessagesInput } => ({
  input: { roomId, first: input.first ?? 50, after: input.after ?? null },
});

export const getChatMessagesQueryOptions = (roomId: string) => ({
  pollInterval: CHAT_MESSAGES_POLL_INTERVAL,
  variables: getChatMessagesVariables(roomId),
});
