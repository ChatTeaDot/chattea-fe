import { useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "../components";
import { COMMUNITY_POSTS_QUERY } from "../operations";
import { ErrorState, type PostsData, styles } from "./screen-shared";

export const CommunityScreen = () => {
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  return (
    <NativeScreen>
      <NativeScroll>
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
        {posts.loading ? <LoadingState /> : null}
        {posts.error ? <ErrorState /> : null}
        {!posts.loading && !posts.error && posts.data?.communityPosts.length === 0 ? (
          <EmptyState title="첫 이야기를 남겨 보세요" body="가볍게 시작해도 좋아요." />
        ) : null}
        {posts.data?.communityPosts.map((post) => (
          <Pressable
            key={post.id}
            onPress={() => router.push(`/community/${post.id}`)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.postMeta}>
                <MetaText>{post.authorName}</MetaText>
                <MetaText>{formatRelativeDate(post.createdAt)}</MetaText>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text numberOfLines={2} style={styles.postBody}>
                {post.body}
              </Text>
              <MetaText>댓글 {post.commentCount}개</MetaText>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};
