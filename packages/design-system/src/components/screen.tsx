import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "../theme";

type ScreenProps = PropsWithChildren<{
  avoidKeyboard?: boolean;
  includeTopInset?: boolean;
  scroll?: boolean;
}>;

const Screen = ({
  avoidKeyboard = false,
  children,
  includeTopInset = true,
  scroll = false,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const insetStyle = {
    paddingBottom: Math.max(insets.bottom, 16),
    paddingTop: includeTopInset ? insets.top : 0,
  };

  if (scroll) {
    return (
      <View style={styles.safeArea}>
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerStyle={[styles.scrollContent, insetStyle]}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  const content = <View style={[styles.safeArea, styles.content, insetStyle]}>{children}</View>;

  if (!avoidKeyboard) return content;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS === "ios"}
      style={styles.safeArea}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  content: { gap: theme.spacing.md, paddingHorizontal: theme.spacing.md },
  scrollContent: {
    flexGrow: 1,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
}));

export default Screen;
