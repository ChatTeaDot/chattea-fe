import { LegendList } from "@legendapp/list/react-native";
import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { spacing } from "@/theme/tokens";

import { CommunityHeader } from "./community-header";
import { CommunityPostCard } from "./community-post-card";
import { CommunityPostForm } from "./community-post-form";
import {
  useCommunityPosts,
  useCreateCommunityComment,
  useCreateCommunityPost,
  useReportCommunityPost,
} from "./hooks";
import { CommunityPost } from "./types";

export const CommunityScreen = () => {
  const posts = useCommunityPosts();
  const createPost = useCreateCommunityPost();
  const createComment = useCreateCommunityComment();
  const reportPost = useReportCommunityPost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submitPost = () => {
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
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    return (
      <CommunityPostCard
        onComment={() => createComment.mutate({ postId: item.id, body: "공감해요" })}
        onReport={() => reportPost.mutate({ postId: item.id, reason: "사용자 신고" })}
        post={item}
      />
    );
  };

  return (
    <Screen>
      <CommunityHeader />
      <CommunityPostForm
        body={body}
        disabled={createPost.isPending}
        onBodyChange={setBody}
        onSubmit={submitPost}
        onTitleChange={setTitle}
        title={title}
      />
      <LegendList
        recycleItems={false}
        data={posts.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        style={styles.listFrame}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});
