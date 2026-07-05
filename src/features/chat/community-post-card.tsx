import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { CommunityPost } from "./types";

type CommunityPostCardProps = {
  post: CommunityPost;
};

export const CommunityPostCard = ({ post }: CommunityPostCardProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.author}>{post.authorName}</Text>
      <Text style={styles.name}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.meta}>댓글 {post.commentCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  author: {
    color: colors.primary,
    fontWeight: "700",
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
});
