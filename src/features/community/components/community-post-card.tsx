import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { CommunityPost } from "../types";

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

const styles = StyleSheet.create((theme: AppTheme) => ({
  row: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  author: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  name: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
}));
