import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { formatRelativeDate } from "@/shared/lib";

import type { PostRowProps } from "../types";

const PostRow = ({ authorName, commentCount, createdAt, id, onOpen, title }: PostRowProps) => {
  const open = useCallback(() => onOpen(id), [id, onOpen]);
  return (
    <Pressable
      accessibilityRole="link"
      onPress={open}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.sub}>
          {`${authorName} · 댓글 ${commentCount} · ${formatRelativeDate(createdAt)}`}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    borderBottomColor: theme.colors.surface,
    borderBottomWidth: 1,
    minHeight: 56,
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.control,
  },
  rowPressed: {
    backgroundColor: theme.colors.surface,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 13,
  },
}));

export default PostRow;
