import { useNavigation } from "expo-router";
import { EllipsisVertical } from "lucide-react-native";
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
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation("community");
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
    <EmptyState title={t("comments.emptyTitle")} body={t("comments.emptyBody")} />
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel={t("post.moreOptions")}
          accessibilityRole="button"
          hitSlop={8}
          onPress={reportPost}
          style={styles.headerAction}
        >
          <EllipsisVertical color={theme.colors.text} size={20} />
        </Pressable>
      ),
    });
  }, [navigation, reportPost, t, theme]);

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
              <EmptyState title={t("post.notFoundTitle")} body={t("post.notFoundBody")} />
            ) : null}
            {post ? <PostDetailCard post={post} /> : null}
            {post ? (
              <Text style={styles.commentTitle}>
                {t("comments.title", { count: post.commentCount })}
              </Text>
            ) : null}
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
