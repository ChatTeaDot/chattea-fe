import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { Room } from "./types";

type RoomListItemProps = {
  room: Room;
};

export const RoomListItem = ({ room }: RoomListItemProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/room/${room.id}`)}
      style={styles.row}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{room.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.roomText}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.message}>{room.lastMessage ?? "먼저 대화를 걸어보세요"}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  message: {
    color: colors.muted,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  roomText: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md,
  },
});
