import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { NativeButton, NativeScreen, NativeScroll } from "../components";
import { COMMUNITY_POSTS_QUERY, CREATE_COMMUNITY_POST_MUTATION } from "../operations";
import type { CommunityPost } from "../types";
import { NativeTextInput, showActionError, styles } from "./screen-shared";

export const CommunityWriteScreen = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [createPost, state] = useMutation<{ createCommunityPost: CommunityPost }>(
    CREATE_COMMUNITY_POST_MUTATION,
  );
  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      await createPost({
        variables: { input: { title: title.trim(), body: body.trim() } },
        refetchQueries: [COMMUNITY_POSTS_QUERY],
      });
      router.back();
    } catch (error) {
      showActionError(error);
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>다른 사람을 존중하는 말로 편하게 이야기해 주세요.</Text>
        <NativeTextInput
          maxLength={80}
          onChangeText={setTitle}
          placeholder="제목"
          style={styles.input}
          value={title}
        />
        <NativeTextInput
          maxLength={1000}
          multiline
          onChangeText={setBody}
          placeholder="어떤 이야기를 나누고 싶나요?"
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={body}
        />
        <NativeButton
          disabled={!title.trim() || !body.trim() || state.loading}
          label="게시하기"
          onPress={() => void submit()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};
