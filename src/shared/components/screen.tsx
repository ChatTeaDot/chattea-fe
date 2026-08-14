import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { colors, darkColors, spacing } from "@/theme/tokens";

type ScreenProps = PropsWithChildren<{ scroll?: boolean }>;

/** Native-stack owns the top safe area; this container owns keyboard and horizontal rhythm. */
export const Screen = ({ children, scroll = false }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const content = scroll ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.scrollContent}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      style={[
        styles.safeArea,
        { backgroundColor: scheme === "dark" ? darkColors.background : colors.background },
      ]}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.screen,
  },
});
