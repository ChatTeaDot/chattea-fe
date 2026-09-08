import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeCard } from "@/shared/components";
import { formatRelativeDate } from "@/shared/lib";

import type { PostRowProps } from "../types";

const PostRow = ({
  authorName,
  body,
  commentCount,
  createdAt,
  id,
  onOpen,
  title,
}: PostRowProps) => {
  const open = useCallback(() => onOpen(id), [id, onOpen]);
  return (
    <Pressable accessibilityRole="link" onPress={open} style={styles.pressableCard}>
      <NativeCard>
        <View style={styles.postMeta}>
          <MetaText>{authorName}</MetaText>
          <MetaText>{formatRelativeDate(createdAt)}</MetaText>
        </View>
        <Text style={styles.postTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.postBody}>
          {body}
        </Text>
        <MetaText>댓글 {commentCount}개</MetaText>
      </NativeCard>
    </Pressable>
  );
};
const styles = StyleSheet.create((theme) => ({
  pressableCard: { borderRadius: 20 },
  postMeta: { flexDirection: "row", justifyContent: "space-between" },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  postBody: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
}));
export default PostRow;
