import { router } from "expo-router";
import { memo, useCallback, useState } from "react";
import { StyleSheet } from "react-native-unistyles";

import type { CommunityFilter, CommunityPost } from "@/features/community";
import {
  ChipRow,
  COMMUNITY_FILTERS,
  PostRow as PostRowComponent,
  useCommunityPosts,
  WriteFab,
} from "@/features/community";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const PostRow = memo(PostRowComponent);
PostRow.displayName = "PostRow";

const keyExtractor = (item: CommunityPost) => item.id;

const CommunityScreen = () => {
  const { posts, openPost } = useCommunityPosts();
  const [filter, setFilter] = useState<CommunityFilter>("전체");
  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostRow
        authorName={item.authorName}
        body={item.body}
        commentCount={item.commentCount}
        createdAt={item.createdAt}
        id={item.id}
        onOpen={openPost}
        title={item.title}
      />
    ),
    [openPost],
  );
  const empty = posts.loading ? (
    <LoadingState />
  ) : posts.error ? (
    <ErrorState />
  ) : (
    <EmptyState title="첫 이야기를 남겨 보세요" body="가볍게 시작해도 좋아요." />
  );

  return (
    <NativeScreen>
      <NativeList
        contentContainerStyle={styles.listContent}
        data={posts.data?.communityPosts ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        ListHeaderComponent={
          <ChipRow items={COMMUNITY_FILTERS} onSelect={setFilter} selected={filter} />
        }
        renderItem={renderPost}
      />
      <WriteFab onPress={() => router.push("/community/new")} />
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  listContent: {
    gap: 0,
    paddingBottom: rt.insets.bottom + theme.sizes.tabBar + 56 + theme.spacing.xl,
    paddingHorizontal: 0,
  },
}));

export default CommunityScreen;
