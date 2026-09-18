import { useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import { memo, useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { CommunityComment } from "@/features/community";
import {
  CommentInputBar,
  CommentRow as CommentRowComponent,
  PostDetailCard,
  updateCommunityCommentDraft,
  useCommunityPost,
} from "@/features/community";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const CommentRow = memo(CommentRowComponent);
CommentRow.displayName = "CommentRow";

const keyExtractor = (item: CommunityComment) => item.id;

const CommunityPostScreen = () => {
  const {
    posts,
    comments,
    post,
    draft,
    setDraft,
    submitComment,
    commentState,
    reportPost,
    reportCommentById,
  } = useCommunityPost();
  const navigation = useNavigation();
  const { theme } = useUnistyles();
  const renderComment = useCallback(
    ({ item }: { item: CommunityComment }) => (
      <CommentRow
        authorName={item.authorName}
        body={item.body}
        createdAt={item.createdAt}
        id={item.id}
        onReport={reportCommentById}
      />
    ),
    [reportCommentById],
  );
  const commentEmpty = comments.loading ? (
    <LoadingState />
  ) : comments.error ? (
    <ErrorState />
  ) : (
    <EmptyState title="아직 댓글이 없어요" body="첫 댓글을 편하게 남겨 보세요." />
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel="더 보기"
          accessibilityRole="button"
          hitSlop={8}
          onPress={reportPost}
          style={styles.headerAction}
        >
          <SymbolView
            name={{ android: "more_vert", ios: "ellipsis" }}
            size={20}
            style={styles.moreIcon}
            tintColor={theme.colors.text}
          />
        </Pressable>
      ),
    });
  }, [navigation, reportPost, theme]);

  return (
    <NativeScreen>
      <NativeList
        contentContainerStyle={styles.listContent}
        data={comments.data?.communityComments ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={commentEmpty}
        ListHeaderComponent={
          <View>
            {posts.loading ? <LoadingState /> : null}
            {!posts.loading && !post ? (
              <EmptyState
                title="글을 찾을 수 없어요"
                body="목록으로 돌아가 다른 이야기를 확인해 보세요."
              />
            ) : null}
            {post ? <PostDetailCard post={post} /> : null}
            {post ? <Text style={styles.commentTitle}>댓글 {post.commentCount}</Text> : null}
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        renderItem={renderComment}
      />
      <CommentInputBar
        disabled={!draft.body.trim() || commentState.loading}
        onChangeBody={(body) => setDraft((current) => updateCommunityCommentDraft(current, body))}
        onSubmit={() => void submitComment()}
        value={draft.body}
      />
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  headerAction: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  moreIcon: {
    transform: [{ rotate: "90deg" }],
  },
  listContent: {
    gap: 0,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: 0,
  },
  listHeader: {
    paddingBottom: 0,
  },
  commentTitle: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 20,
  },
}));

export default CommunityPostScreen;
