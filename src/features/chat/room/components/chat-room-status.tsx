import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

type ChatRoomStatusProps = {
  isPeerTyping: boolean;
  readReceiptVersion: number;
};

export const ChatRoomStatus = ({ isPeerTyping, readReceiptVersion }: ChatRoomStatusProps) => {
  return (
    <>
      {isPeerTyping ? <Text style={styles.presence}>상대가 입력 중...</Text> : null}
      {readReceiptVersion > 0 ? <Text style={styles.status}>읽음 상태 업데이트됨</Text> : null}
    </>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  presence: {
    color: theme.colors.primary,
    fontSize: 13,
  },
  status: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
}));
