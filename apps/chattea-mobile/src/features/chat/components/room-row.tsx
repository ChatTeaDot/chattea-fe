import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { RoomRowProps } from "../types";

const RoomRow = ({ id, lastMessage, name, onOpen, onPressIn, unreadCount }: RoomRowProps) => {
  const open = () => onOpen(id);
  const pressIn = () => onPressIn?.(id);
  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="button"
      onPress={open}
      onPressIn={pressIn}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.avatar} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.preview}>
          {lastMessage ?? "첫 인사를 건네 보세요."}
        </Text>
      </View>
      {unreadCount > 0 ? <Text style={styles.badge}>{unreadCount}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    alignItems: "center",
    borderBottomColor: theme.colors.surface,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.control,
    minHeight: 56,
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.control,
  },
  rowPressed: {
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.pill,
    height: 48,
    width: 48,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  preview: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    textAlign: "center",
  },
}));

export default RoomRow;
