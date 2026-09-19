export type KeyFactory = () => string;

export type ChatMessageDraft = {
  idempotencyKey: string;
  text: string;
};

export type MessageRowProps = {
  createdAt: string;
  id: string;
  mine: boolean;
  onReport: (id: string) => void;
  showReadStatus: boolean;
  text: string;
};

export type MessageComposerProps = {
  disabled: boolean;
  maxLength: number;
  onChangeText: (text: string) => void;
  onSend: () => void;
  value: string;
};

export type RoomMenuButtonProps = {
  onPress: () => void;
};

export type RoomRowProps = {
  id: string;
  lastMessage: string | null;
  name: string;
  onOpen: (id: string) => void;
  unreadCount: number;
};
