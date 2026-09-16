import { Send } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeTextInput } from "@/shared/components";

import type { MessageComposerProps } from "../types";

const MessageComposer = ({
  disabled,
  maxLength,
  onChangeText,
  onSend,
  value,
}: MessageComposerProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.pill}>
      <NativeTextInput
        accessibilityLabel="메시지 입력"
        maxLength={maxLength}
        multiline
        onChangeText={onChangeText}
        placeholder="메시지 입력…"
        style={styles.input}
        value={value}
      />
      <Pressable
        accessibilityLabel="메시지 보내기"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onSend}
        style={({ pressed }) => [styles.send, (pressed || disabled) && styles.sendPressed]}
      >
        <Send color={theme.colors.accentText} size={20} strokeWidth={1.75} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignItems: "flex-end",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 110,
    paddingBottom: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  send: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sendPressed: {
    opacity: 0.62,
  },
}));

export default MessageComposer;
