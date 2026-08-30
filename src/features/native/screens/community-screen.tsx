import { useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeList,
  NativeScreen,
  SectionHeading,
} from "@/features/native/components";
import { COMMUNITY_POSTS_QUERY } from "@/features/native/operations";
import type { CommunityPost } from "@/features/native/types";

import { ErrorState, type PostsData, styles } from "./screen-shared";

type PostRowProps = Omit<CommunityPost, "id"> & {
  id: string;
  onOpen: (id: string) => void;
};

const PostRow = memo(
  ({ authorName, body, commentCount, createdAt, id, onOpen, title }: PostRowProps) => {
    const open = useCallback(() => onOpen(id), [id, onOpen]);
    return (
      <Pressable accessibilityRole="link" onPress={open} style={styles.pressableCard}>
        <NativeCard>
          <View style={styles.postMeta}>
            <MetaText>{authorName}</MetaText>
            <MetaText>{formatRelativeDate(createdAt)}</MetaText>
          </View>
          <Text style={styles.postTitle}>{title}</Text>
          <Text numberOfLines={2} style={styles.postBody}>
            {body}
          </Text>
          <MetaText>댓글 {commentCount}개</MetaText>
        </NativeCard>
      </Pressable>
    );
  },
);
PostRow.displayName = "PostRow";

const keyExtractor = (item: CommunityPost) => item.id;

export const CommunityScreen = () => {
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const openPost = useCallback((id: string) => router.push(`/community/${id}`), []);
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
