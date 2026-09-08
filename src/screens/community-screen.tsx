import { router } from "expo-router";
import { memo, useCallback } from "react";

import type { CommunityPost } from "@/features/community";
import { PostRow as PostRowComponent, useCommunityPosts } from "@/features/community";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeList,
  NativeScreen,
  SectionHeading,
} from "@/shared/components";

const PostRow = memo(PostRowComponent);
PostRow.displayName = "PostRow";

const keyExtractor = (item: CommunityPost) => item.id;

const CommunityScreen = () => {
  const { posts, openPost } = useCommunityPosts();
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
        data={posts.data?.communityPosts ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        ListHeaderComponent={
          <SectionHeading
            title="지금 나누는 이야기"
            action={
              <NativeButton
                label="글 쓰기"
                onPress={() => router.push("/community/new")}
                tone="quiet"
              />
            }
          />
        }
        renderItem={renderPost}
      />
    </NativeScreen>
  );
};

export default CommunityScreen;
