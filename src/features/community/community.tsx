import { LegendList } from "@legendapp/list/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentState, Screen } from "@/shared/components";
import { colors, spacing } from "@/theme/tokens";

import {
  CommunityPostCard,
  CommunityPostSection,
  CommunityTopBar,
  CommunityWriteButton,
} from "./components";
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
      {posts.loading ? <ContentState kind="loading" /> : null}
      {posts.error ? <ContentState kind="error" /> : null}
      {!posts.loading && !posts.error && posts.data?.length === 0 ? (
        <ContentState
          kind="empty"
          title="아직 올라온 이야기가 없어요"
          message="첫 이야기를 편하게 남겨보세요."
        />
      ) : null}
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
