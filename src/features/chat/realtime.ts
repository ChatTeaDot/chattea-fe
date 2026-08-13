const unavailableRoomRealtime = {
  isPeerTyping: false,
  readReceiptVersion: 0,
} as const;

export const useRoomRealtime = (_roomId: string) => unavailableRoomRealtime;
