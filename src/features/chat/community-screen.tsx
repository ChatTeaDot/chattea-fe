import { LegendList } from "@legendapp/list/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components";
import { colors, spacing } from "@/theme/tokens";

import { CommunityPostCard } from "./community-post-card";
import { CommunityPostSection } from "./community-post-section";
import { CommunityTopBar } from "./community-top-bar";
import { CommunityWriteButton } from "./community-write-button";
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
      <CommunityTopBar />
      <CommunityPostSection posts={bestPosts} title="BEST 글" />

      <Text style={styles.sectionTitle}>최신 글</Text>
      <LegendList
        contentContainerStyle={styles.list}
        data={latestPosts}
        keyExtractor={(item) => item.id}
        recycleItems={false}
        renderItem={renderPost}
        style={styles.listFrame}
      />

      <CommunityWriteButton />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: 96,
    paddingTop: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
});
