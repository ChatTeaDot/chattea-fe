import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppButton } from "@/shared/components/app-button";
import { colors, spacing } from "@/theme/tokens";

import { CommunityPost } from "./types";

type CommunityPostCardProps = {
  post: CommunityPost;
  onComment: () => void;
  onReport: () => void;
};

export const CommunityPostCard = ({ post, onComment, onReport }: CommunityPostCardProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.author}>{post.anonymousName}</Text>
      <Text style={styles.name}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.meta}>댓글 {post.commentCount}</Text>
      <View style={styles.actions}>
        <AppButton title="댓글" onPress={onComment} />
        <AppButton title="신고" onPress={onReport} />
      </View>
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
