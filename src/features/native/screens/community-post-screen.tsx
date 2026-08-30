import { useMutation, useQuery } from "@apollo/client/react";
import { memo, useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  createCommunityCommentDraft,
  toCreateCommunityCommentVariables,
  updateCommunityCommentDraft,
} from "@/features/native/community-idempotency";
import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeComposer,
  NativeKeyboardScreen,
  NativeList,
  SectionHeading,
} from "@/features/native/components";
import {
  COMMUNITY_COMMENTS_QUERY,
  COMMUNITY_POSTS_QUERY,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_POST_MUTATION,
} from "@/features/native/operations";
import type { CommunityComment } from "@/features/native/types";

import {
  type CommentsData,
  ErrorState,
  NativeTextInput,
  type PostsData,
  showActionError,
  styles,
  useRouteParam,
} from "./screen-shared";

type CommentRowProps = {
  authorName: string;
  body: string;
  createdAt: string;
  id: string;
  onReport: (id: string) => void;
};

const CommentRow = memo(({ authorName, body, createdAt, id, onReport }: CommentRowProps) => {
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <NativeCard>
      <View style={styles.postMeta}>
        <MetaText>{authorName}</MetaText>
        <MetaText>{formatRelativeDate(createdAt)}</MetaText>
      </View>
      <Text style={styles.detailBody}>{body}</Text>
      <NativeButton label="댓글 신고하기" onPress={report} tone="quiet" />
    </NativeCard>
  );
});
CommentRow.displayName = "CommentRow";

const keyExtractor = (item: CommunityComment) => item.id;

export const CommunityPostScreen = () => {
  const postId = useRouteParam("post-id");
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const comments = useQuery<CommentsData>(COMMUNITY_COMMENTS_QUERY, {
    skip: !postId,
    variables: { postId },
  });
  const [createComment, commentState] = useMutation<
    { createCommunityComment: CommunityComment },
    ReturnType<typeof toCreateCommunityCommentVariables>
  >(CREATE_COMMUNITY_COMMENT_MUTATION);
  const [reportComment] = useMutation<{ reportCommunityComment: boolean }>(
    REPORT_COMMUNITY_COMMENT_MUTATION,
  );
  const [report] = useMutation<{ reportCommunityPost: boolean }>(REPORT_COMMUNITY_POST_MUTATION);
  const [draft, setDraft] = useState(createCommunityCommentDraft);
  const post = posts.data?.communityPosts.find((item) => item.id === postId);

  const submitComment = async () => {
    if (!postId) return;
    const variables = toCreateCommunityCommentVariables(postId, draft);
    if (!variables.input.body) return;
    try {
      await createComment({ variables });
      setDraft((current) =>
        current.idempotencyKey === draft.idempotencyKey ? createCommunityCommentDraft() : current,
      );
      void comments.refetch();
      void posts.refetch();
    } catch (error) {
      showActionError(error);
    }
  };

  const reportPost = useCallback(() => {
    if (!postId) return;
    Alert.alert("이 글을 신고할까요?", "운영팀이 내용을 확인해요.", [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        style: "destructive",
        onPress: () => {
          void report({ variables: { input: { postId, reason: "사용자 신고" } } })
            .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
            .catch(showActionError);
        },
      },
    ]);
  }, [postId, report]);
  const reportCommentById = useCallback(
    (commentId: string) => {
      Alert.alert("이 댓글을 신고할까요?", "운영팀이 내용을 확인해요.", [
        { text: "취소", style: "cancel" },
        {
          text: "신고하기",
          style: "destructive",
          onPress: () => {
            void reportComment({
              variables: { input: { commentId, reason: "사용자 신고" } },
            })
              .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
              .catch(showActionError);
          },
        },
      ]);
    },
    [reportComment],
  );
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
            {post ? (
              <NativeCard>
                <View style={styles.postMeta}>
                  <MetaText>{post.authorName}</MetaText>
                  <MetaText>{formatRelativeDate(post.createdAt)}</MetaText>
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.detailBody}>{post.body}</Text>
                <NativeButton label="글 신고하기" onPress={reportPost} tone="quiet" />
              </NativeCard>
            ) : null}
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
