import { memo, useCallback } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { CommunityComment } from "@/features/community";
import {
  CommentRow as CommentRowComponent,
  PostDetailCard,
  updateCommunityCommentDraft,
  useCommunityPost,
} from "@/features/community";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeComposer,
  NativeKeyboardScreen,
  NativeList,
  NativeTextInput,
  SectionHeading,
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

  return (
    <NativeKeyboardScreen>
      <NativeList
        data={comments.data?.communityComments ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={commentEmpty}
        ListHeaderComponent={
          <View style={styles.stack}>
            {posts.loading ? <LoadingState /> : null}
            {!posts.loading && !post ? (
              <EmptyState
                title="글을 찾을 수 없어요"
                body="목록으로 돌아가 다른 이야기를 확인해 보세요."
              />
            ) : null}
            {post ? <PostDetailCard post={post} reportPost={reportPost} /> : null}
            <SectionHeading title="댓글" />
          </View>
        }
        renderItem={renderComment}
      />
      <NativeComposer>
        <NativeTextInput
          multiline
          onChangeText={(body) => setDraft((current) => updateCommunityCommentDraft(current, body))}
          placeholder="댓글을 남겨 보세요"
          style={styles.input}
          value={draft.body}
        />
        <NativeButton
          disabled={!draft.body.trim() || commentState.loading}
          label="댓글 등록"
          onPress={() => void submitComment()}
        />
      </NativeComposer>
    </NativeKeyboardScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.md },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
  },
}));

export default CommunityPostScreen;
