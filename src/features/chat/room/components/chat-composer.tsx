import { Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

type ChatComposerProps = {
  draft: string;
  textLimit: number;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
};

export const ChatComposer = ({ draft, textLimit, onChangeDraft, onSend }: ChatComposerProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.wrap}>
      <TextInput
        placeholder="차분하게 첫 문장을 건네보세요"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        maxLength={textLimit}
        onChangeText={onChangeDraft}
        value={draft}
      />
      <Pressable
        accessibilityLabel="메시지 전송"
        accessibilityRole="button"
        onPress={onSend}
        style={styles.sendButton}
      >
        <Text style={styles.sendText}>전송</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  wrap: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.utility,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sendText: {
    color: theme.colors.primaryText,
    fontWeight: "900",
  },
}));
