import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../shared/components/app-button";
import { AppInput } from "../../shared/components/app-input";
import { Screen } from "../../shared/components/screen";
import { colors, spacing } from "../../theme/tokens";
import {
  useCommunityPosts,
  useCreateCommunityComment,
  useCreateCommunityPost,
  useReportCommunityPost,
} from "./hooks";
import { CommunityPost } from "./types";

export function CommunityScreen() {
  const posts = useCommunityPosts();
  const createPost = useCreateCommunityPost();
  const createComment = useCreateCommunityComment();
  const reportPost = useReportCommunityPost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submitPost() {
    if (!title.trim() || !body.trim()) {
      return;
    }

    createPost.mutate(
      { title, body },
      {
        onSuccess() {
          setTitle("");
          setBody("");
        },
      },
    );
  }

  function renderPost({ item }: { item: CommunityPost }) {
    return (
      <View style={styles.row}>
        <Text style={styles.author}>{item.anonymousNickname}</Text>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.meta}>댓글 {item.commentCount}</Text>
        <View style={styles.actions}>
          <AppButton
            title="댓글"
            onPress={() => createComment.mutate({ postId: item.id, body: "공감해요" })}
          />
          <AppButton
            title="신고"
            onPress={() => reportPost.mutate({ postId: item.id, reason: "사용자 신고" })}
          />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.link}>닫기</Text>
        </Pressable>
      </View>
      <View style={styles.form}>
        <AppInput
          label={`제목 ${title.length}/80`}
          maxLength={80}
          onChangeText={setTitle}
          value={title}
        />
        <AppInput
          label={`본문 ${body.length}/1000`}
          maxLength={1000}
          onChangeText={setBody}
          value={body}
        />
        <AppButton disabled={createPost.isPending} onPress={submitPost} title="익명 글쓰기" />
      </View>
      <LegendList
        data={posts.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  form: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  author: {
    color: colors.primary,
    fontWeight: "700",
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
