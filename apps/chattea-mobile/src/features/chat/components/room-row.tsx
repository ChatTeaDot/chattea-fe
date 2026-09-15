import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeCard } from "@/shared/components";

import type { RoomRowProps } from "../types";

const RoomRow = ({ id, lastMessage, name, onOpen, unreadCount }: RoomRowProps) => {
  const open = useCallback(() => onOpen(id), [id, onOpen]);
  return (
    <Pressable accessibilityRole="link" onPress={open} style={styles.pressableCard}>
      <NativeCard>
        <View style={styles.roomRow}>
          <View style={styles.roomText}>
            <Text style={styles.postTitle}>{name}</Text>
            <MetaText>{lastMessage ?? "첫 인사를 건네 보세요."}</MetaText>
          </View>
          {unreadCount > 0 ? (
            <Text style={styles.unreadText}>새 메시지 {unreadCount}개</Text>
          ) : null}
        </View>
      </NativeCard>
    </Pressable>
  );
};
const styles = StyleSheet.create((theme) => ({
  pressableCard: { borderRadius: 20 },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  roomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  roomText: { flex: 1, gap: theme.spacing.xs },
  unreadText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700", textAlign: "right" },
}));
export default RoomRow;
