import { LegendList } from "@legendapp/list/react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { colors, spacing } from "@/theme/tokens";

import { CommunityPostCard } from "./community-post-card";
import { useCommunityPosts } from "./hooks";
import { CommunityPost } from "./types";

export const CommunityScreen = () => {
  const posts = useCommunityPosts();
  const bestPosts = (posts.data ?? []).slice(0, 2);
  const latestPosts = (posts.data ?? []).slice(2);

  const renderPost = ({ item }: { item: CommunityPost }) => {
    return <CommunityPostCard post={item} />;
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityLabel="알림" accessibilityRole="button" style={styles.iconButton}>
            <View style={styles.notificationGlyph}>
              <View style={styles.notificationHandle} />
              <View style={styles.notificationBell} />
              <View style={styles.notificationRim} />
              <View style={styles.notificationClapper} />
            </View>
          </Pressable>
          <Pressable accessibilityLabel="커뮤니티 프로필" accessibilityRole="button" style={styles.profileButton}>
            <View style={styles.profileGlyph}>
              <View style={styles.profileGlyphHead} />
              <View style={styles.profileGlyphBody} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BEST 글</Text>
        <Pressable accessibilityRole="button">
          <Text style={styles.moreText}>더보기</Text>
        </Pressable>
      </View>

      <View style={styles.bestList}>
        {bestPosts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>최신 글</Text>
      <LegendList
        contentContainerStyle={styles.list}
        data={latestPosts}
        keyExtractor={(item) => item.id}
        recycleItems={false}
        renderItem={renderPost}
        style={styles.listFrame}
      />

      <Pressable accessibilityLabel="글쓰기" accessibilityRole="button" style={styles.writeButton}>
        <Text style={styles.writeIcon}>✎</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  bestList: {
    gap: spacing.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 96,
    paddingTop: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
  moreText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  notificationBell: {
    borderBottomWidth: 0,
    borderColor: colors.text,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.8,
    height: 13,
    width: 16,
  },
  notificationClapper: {
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 3,
    marginTop: 1,
    width: 5,
  },
  notificationGlyph: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  notificationHandle: {
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 2,
    marginBottom: -1,
    width: 5,
  },
  notificationRim: {
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 2,
    marginTop: -1,
    width: 19,
  },
  profileButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  profileGlyph: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  profileGlyphBody: {
    borderColor: colors.text,
    borderRadius: 999,
    borderWidth: 1.8,
    height: 8,
    marginTop: 2,
    width: 18,
  },
  profileGlyphHead: {
    borderColor: colors.text,
    borderRadius: 999,
    borderWidth: 1.8,
    height: 8,
    width: 8,
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  writeButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    bottom: spacing.xl,
    height: 52,
    justifyContent: "center",
    position: "absolute",
    right: spacing.lg,
    width: 52,
  },
  writeIcon: {
    color: colors.primaryText,
    fontSize: 26,
    fontWeight: "900",
  },
});
