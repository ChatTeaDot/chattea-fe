import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeTextInput } from "@/shared/components";

import type { CommentInputBarProps } from "../types";

const CommentInputBar = ({ disabled, onChangeBody, onSubmit, value }: CommentInputBarProps) => {
  const { theme } = useUnistyles();
  return (
    <KeyboardStickyView>
      <SafeAreaView edges={["bottom"]}>
        <View style={styles.bar}>
          <NativeTextInput
            onChangeText={onChangeBody}
            placeholder="댓글 입력…"
            style={styles.input}
            value={value}
          />
          <Pressable
            accessibilityLabel="댓글 등록"
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onSubmit}
            style={({ pressed }) => [styles.send, (pressed || disabled) && styles.sendDisabled]}
          >
            <SymbolView
              name={{ android: "send", ios: "paperplane.fill" }}
              size={16}
              tintColor={theme.colors.accentText}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardStickyView>
  );
};

const styles = StyleSheet.create((theme) => ({
  bar: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.control,
    marginTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 36,
    paddingVertical: 0,
  },
  send: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sendDisabled: {
    opacity: 0.4,
  },
}));

export default CommentInputBar;
