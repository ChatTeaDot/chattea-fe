import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

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
        <Pressable accessibilityRole="button">
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

const styles = StyleSheet.create({
  bestList: {
    gap: spacing.sm,
  },
  moreText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
});
