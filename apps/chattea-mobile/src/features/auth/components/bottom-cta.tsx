import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

const BottomCta = ({ children }: PropsWithChildren) => {
  const { rt } = useUnistyles();
  return (
    <KeyboardStickyView offset={{ closed: 0, opened: -rt.insets.bottom }}>
      <View style={styles.bar}>{children}</View>
    </KeyboardStickyView>
  );
};

const styles = StyleSheet.create((theme: AppTheme, rt) => ({
  bar: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.surface,
    borderTopWidth: 1,
    paddingBottom: Math.max(rt.insets.bottom, 16),
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
}));

export default BottomCta;
