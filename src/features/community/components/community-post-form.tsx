import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppButton, AppInput } from "@/shared/components";
import { spacing } from "@/theme/tokens";

type CommunityPostFormProps = {
  body: string;
  disabled: boolean;
  title: string;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
};

export const CommunityPostForm = ({
  body,
  disabled,
  title,
  onBodyChange,
  onSubmit,
  onTitleChange,
}: CommunityPostFormProps) => {
  return (
    <View style={styles.form}>
      <AppInput
        label={`제목 ${title.length}/80`}
        maxLength={80}
        onChangeText={onTitleChange}
        value={title}
      />
      <AppInput
        label={`본문 ${body.length}/1000`}
        maxLength={1000}
        onChangeText={onBodyChange}
        value={body}
      />
      <AppButton disabled={disabled} onPress={onSubmit} title="익명 글쓰기" />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
  },
});
