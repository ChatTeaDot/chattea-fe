export type ChatRoom = {
  id: string;
  name: string;
  lastMessage: string | null;
  unreadCount: number;
};

export type ChatMessage = {
  __typename?: "ChatMessage";
  id: string;
  roomId: string;
  senderUserId: string | null;
  text: string;
  idempotencyKey: string | null;
  createdAt: string;
};

export type RoomsData = { chatRooms: ChatRoom[] };

export type MessagesData = { chatMessages: ChatMessage[] };
