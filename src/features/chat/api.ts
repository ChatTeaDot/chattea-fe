import { gql } from "@apollo/client";

export const CHAT_ROOMS_QUERY = gql`
  query NativeChatRooms {
    chatRooms {
      id
      name
      lastMessage
      unreadCount
    }
  }
`;

export const CHAT_MESSAGES_QUERY = gql`
  query NativeChatMessages($input: ChatMessagesInput!) {
    chatMessages(input: $input) {
      id
      roomId
      senderUserId
      text
      idempotencyKey
      createdAt
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation NativeSendMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      id
      roomId
      senderUserId
      text
      idempotencyKey
      createdAt
    }
  }
`;

export const MARK_ROOM_READ_MUTATION = gql`
  mutation NativeMarkRoomRead($input: MarkRoomReadInput!) {
    markChatRoomRead(input: $input)
  }
`;

export const REPORT_MESSAGE_MUTATION = gql`
  mutation NativeReportMessage($input: ReportMessageInput!) {
    reportChatMessage(input: $input)
  }
`;
