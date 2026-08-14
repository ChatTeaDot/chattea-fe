export type Room = {
  id: string;
  name: string;
  lastMessage: string | null;
};

export type Message = {
  id: string;
  roomId: string;
  text: string;
  status: "failed" | "sending" | "sent";
  mine: boolean;
  createdAt?: string;
};

export type AiSummaryPreview = {
  available: boolean;
  reason: string | null;
  sourceText: string;
  summary: string | null;
};
