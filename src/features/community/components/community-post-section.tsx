import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { CommunityPost } from "../types";
import { CommunityPostCard } from "./community-post-card";

type CommunityPostSectionProps = {
  posts: CommunityPost[];
  title: string;
};

export const CommunityPostSection = ({ posts, title }: CommunityPostSectionProps) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable accessibilityRole="button" style={styles.moreButton}>
          <Text style={styles.moreText}>더보기</Text>
        </Pressable>
      </View>

      <View style={styles.bestList}>
        {posts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  bestList: {
    gap: theme.spacing.sm,
  },
  moreText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  moreButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
}));
