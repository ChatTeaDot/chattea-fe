import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

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

const styles = StyleSheet.create({
  presence: {
    color: colors.primary,
    fontSize: 13,
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
