import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { formatRelativeDate } from "@/shared/lib";

import type { PostDetailCardProps } from "../types";

const PostDetailCard = ({ post }: PostDetailCardProps) => {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {`${post.authorName} · ${formatRelativeDate(post.createdAt)}`}
      </Text>
      <Text style={styles.text}>{post.body}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  body: {
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginBottom: theme.spacing.control,
  },
  text: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
}));

export default PostDetailCard;
