import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { CommentRowProps } from "../types";

const CommentRow = ({ authorName, body, id, onReport }: CommentRowProps) => {
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <Pressable
      delayLongPress={400}
      onLongPress={report}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.meta}>{authorName}</Text>
        <Text style={styles.text}>{body}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    borderBottomColor: theme.colors.surface,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.control,
    paddingVertical: theme.spacing.control,
  },
  itemPressed: {
    opacity: 0.7,
  },
  avatar: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.pill,
    height: 32,
    width: 32,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  text: {
    color: theme.colors.text,
    fontSize: 14,
  },
}));

export default CommentRow;
