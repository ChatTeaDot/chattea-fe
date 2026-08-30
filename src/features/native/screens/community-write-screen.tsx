import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import {
  createCommunityPostDraft,
  toCreateCommunityPostVariables,
  updateCommunityPostDraft,
} from "@/features/native/community-idempotency";
import { NativeButton, NativeScreen, NativeScroll } from "@/features/native/components";
import {
  COMMUNITY_POSTS_QUERY,
  CREATE_COMMUNITY_POST_MUTATION,
} from "@/features/native/operations";
import type { CommunityPost } from "@/features/native/types";

import { NativeTextInput, showActionError, styles } from "./screen-shared";

export const CommunityWriteScreen = () => {
  const [draft, setDraft] = useState(createCommunityPostDraft);
  const [createPost, state] = useMutation<
    { createCommunityPost: CommunityPost },
    ReturnType<typeof toCreateCommunityPostVariables>
  >(CREATE_COMMUNITY_POST_MUTATION);
  const submit = async () => {
    const variables = toCreateCommunityPostVariables(draft);
    if (!variables.input.title || !variables.input.body) return;
    try {
      await createPost({
        variables,
        refetchQueries: [COMMUNITY_POSTS_QUERY],
      });
      setDraft((current) =>
        current.idempotencyKey === draft.idempotencyKey ? createCommunityPostDraft() : current,
      );
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
          onChangeText={(title) =>
            setDraft((current) => updateCommunityPostDraft(current, { title }))
          }
          placeholder="제목"
          style={styles.input}
          value={draft.title}
        />
        <NativeTextInput
          maxLength={1000}
          multiline
          onChangeText={(body) =>
            setDraft((current) => updateCommunityPostDraft(current, { body }))
          }
          placeholder="어떤 이야기를 나누고 싶나요?"
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={draft.body}
        />
        <NativeButton
          disabled={!draft.title.trim() || !draft.body.trim() || state.loading}
          label="게시하기"
          onPress={() => void submit()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};
