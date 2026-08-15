import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { Room } from "../../types";

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

const styles = StyleSheet.create((theme: AppTheme) => ({
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.card,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  message: {
    color: theme.colors.muted,
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  roomText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  row: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
}));
