import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";
import { formatRelativeDate } from "@/shared/lib";

import type { PostDetailCardProps } from "../types";
const PostDetailCard = ({ post, reportPost }: PostDetailCardProps) => {
  return (
    <NativeCard>
      <View style={styles.postMeta}>
        <MetaText>{post.authorName}</MetaText>
        <MetaText>{formatRelativeDate(post.createdAt)}</MetaText>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.detailBody}>{post.body}</Text>
      <NativeButton label="글 신고하기" onPress={reportPost} tone="quiet" />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postMeta: { flexDirection: "row", justifyContent: "space-between" },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  detailBody: { color: theme.colors.text, fontSize: 16, lineHeight: 25 },
}));
export default PostDetailCard;
