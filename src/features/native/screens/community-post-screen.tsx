import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

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
import {
  COMMUNITY_COMMENTS_QUERY,
  COMMUNITY_POSTS_QUERY,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_POST_MUTATION,
} from "../operations";
import type { CommunityComment } from "../types";
import {
  type CommentsData,
  NativeTextInput,
  type PostsData,
  showActionError,
  styles,
  useRouteParam,
} from "./screen-shared";

export const CommunityPostScreen = () => {
  const postId = useRouteParam("post-id");
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const comments = useQuery<CommentsData>(COMMUNITY_COMMENTS_QUERY, {
    skip: !postId,
    variables: { postId },
  });
  const [createComment, commentState] = useMutation<{ createCommunityComment: CommunityComment }>(
    CREATE_COMMUNITY_COMMENT_MUTATION,
  );
  const [reportComment] = useMutation<{ reportCommunityComment: boolean }>(
    REPORT_COMMUNITY_COMMENT_MUTATION,
  );
  const [report] = useMutation<{ reportCommunityPost: boolean }>(REPORT_COMMUNITY_POST_MUTATION);
  const [body, setBody] = useState("");
  const post = posts.data?.communityPosts.find((item) => item.id === postId);

  const submitComment = async () => {
    if (!postId || !body.trim()) return;
    try {
      await createComment({ variables: { input: { postId, body: body.trim() } } });
      setBody("");
      void comments.refetch();
      void posts.refetch();
    } catch (error) {
      showActionError(error);
    }
  };

  const reportPost = () => {
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
  };

  return (
    <NativeScreen>
      <NativeScroll>
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
        {comments.loading ? <LoadingState /> : null}
        {comments.data?.communityComments.map((comment) => (
          <NativeCard key={comment.id}>
            <View style={styles.postMeta}>
              <MetaText>{comment.authorName}</MetaText>
              <MetaText>{formatRelativeDate(comment.createdAt)}</MetaText>
            </View>
            <Text style={styles.detailBody}>{comment.body}</Text>
            <NativeButton
              label="댓글 신고하기"
              onPress={() => {
                Alert.alert("이 댓글을 신고할까요?", "운영팀이 내용을 확인해요.", [
                  { text: "취소", style: "cancel" },
                  {
                    text: "신고하기",
                    style: "destructive",
                    onPress: () => {
                      void reportComment({
                        variables: { input: { commentId: comment.id, reason: "사용자 신고" } },
                      })
                        .then(() =>
                          Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."),
                        )
                        .catch(showActionError);
                    },
                  },
                ]);
              }}
              tone="quiet"
            />
          </NativeCard>
        ))}
        <View style={styles.composer}>
          <NativeTextInput
            multiline
            onChangeText={setBody}
            placeholder="댓글을 남겨 보세요"
            style={styles.input}
            value={body}
          />
          <NativeButton
            disabled={!body.trim() || commentState.loading}
            label="댓글 등록"
            onPress={() => void submitComment()}
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};
