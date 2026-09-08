import { useCallback } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";
import { formatRelativeDate } from "@/shared/lib";

import type { CommentRowProps } from "../types";

const CommentRow = ({ authorName, body, createdAt, id, onReport }: CommentRowProps) => {
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <NativeCard>
      <View style={styles.postMeta}>
        <MetaText>{authorName}</MetaText>
        <MetaText>{formatRelativeDate(createdAt)}</MetaText>
      </View>
      <Text style={styles.detailBody}>{body}</Text>
      <NativeButton label="댓글 신고하기" onPress={report} tone="quiet" />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postMeta: { flexDirection: "row", justifyContent: "space-between" },
  detailBody: { color: theme.colors.text, fontSize: 16, lineHeight: 25 },
}));
export default CommentRow;
