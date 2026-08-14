import { LegendList } from "@legendapp/list/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

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

  if (posts.loading) {
    return (
      <Screen>
        <CommunityTopBar />
        <ContentState kind="loading" />
      </Screen>
    );
  }

  if (posts.error) {
    return (
      <Screen>
        <CommunityTopBar />
        <ContentState kind="error" onRetry={() => void posts.refetch().catch(() => undefined)} />
      </Screen>
    );
  }

  if (posts.data?.length === 0) {
    return (
      <Screen>
        <CommunityTopBar />
        <ContentState
          kind="empty"
          title="아직 올라온 이야기가 없어요"
          message="첫 이야기를 편하게 남겨보세요."
        />
      </Screen>
    );
  }

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

const styles = StyleSheet.create((theme: AppTheme) => ({
  list: {
    gap: theme.spacing.sm,
    paddingBottom: 96,
    paddingTop: theme.spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
}));
