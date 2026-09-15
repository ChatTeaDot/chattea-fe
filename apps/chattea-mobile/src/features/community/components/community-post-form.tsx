import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { NativeButton, NativeTextInput } from "@/shared/components";

import { COMMUNITY_BODY_MAX_LENGTH, COMMUNITY_TITLE_MAX_LENGTH } from "../constants";
import { useCommunityPostDraft } from "../hooks";
import { updateCommunityPostDraft } from "../utils";

const CommunityPostForm = () => {
  const { draft, setDraft, submit, state } = useCommunityPostDraft();
  return (
    <>
      <Text style={styles.guide}>다른 사람을 존중하는 말로 편하게 이야기해 주세요.</Text>
      <NativeTextInput
        maxLength={COMMUNITY_TITLE_MAX_LENGTH}
        onChangeText={(title) =>
          setDraft((current) => updateCommunityPostDraft(current, { title }))
        }
        placeholder="제목"
        style={styles.input}
        value={draft.title}
      />
      <NativeTextInput
        maxLength={COMMUNITY_BODY_MAX_LENGTH}
        multiline
        onChangeText={(body) => setDraft((current) => updateCommunityPostDraft(current, { body }))}
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
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  guide: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
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
  inputLarge: { minHeight: 150 },
}));

export default CommunityPostForm;
