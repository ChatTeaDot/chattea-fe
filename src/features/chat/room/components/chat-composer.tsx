import { Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

type ChatComposerProps = {
  draft: string;
  textLimit: number;
  onAddAttachment: () => void;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
};

export const ChatComposer = ({
  draft,
  textLimit,
  onAddAttachment,
  onChangeDraft,
  onSend,
}: ChatComposerProps) => {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" onPress={onAddAttachment} style={styles.iconButton}>
        <Text style={styles.iconText}>+</Text>
      </Pressable>
      <TextInput
        placeholder="차분하게 첫 문장을 건네보세요"
        placeholderTextColor={colors.muted}
        style={styles.input}
        maxLength={textLimit}
        onChangeText={onChangeDraft}
        value={draft}
      />
      <Pressable accessibilityRole="button" onPress={onSend} style={styles.sendButton}>
        <Text style={styles.sendText}>전송</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendText: {
    color: colors.primaryText,
    fontWeight: "900",
  },
});
