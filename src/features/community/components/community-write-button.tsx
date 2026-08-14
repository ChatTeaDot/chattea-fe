import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const CommunityWriteButton = () => {
  return (
    <Pressable accessibilityLabel="글쓰기" accessibilityRole="button" style={styles.writeButton}>
      <Text style={styles.writeIcon}>✎</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  writeButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    bottom: theme.spacing.xl,
    height: 52,
    justifyContent: "center",
    position: "absolute",
    right: theme.spacing.lg,
    width: 52,
  },
  writeIcon: {
    color: theme.colors.primaryText,
    fontSize: 26,
    fontWeight: "900",
  },
}));
