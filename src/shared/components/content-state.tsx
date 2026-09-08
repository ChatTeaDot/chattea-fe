import { ActivityIndicator, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import AppButton from "./app-button";
import { defaultCopy } from "./constants";

type ContentStateProps = {
  kind: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ContentState = ({ kind, title, message, onRetry }: ContentStateProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={kind === "error" ? "alert" : "summary"}
      style={styles.container}
    >
      {kind === "loading" ? <ActivityIndicator color={theme.colors.primary} /> : null}
      <Text style={styles.title}>{title ?? defaultCopy[kind].title}</Text>
      <Text style={styles.message}>{message ?? defaultCopy[kind].message}</Text>
      {kind === "error" && onRetry ? (
        <AppButton
          accessibilityLabel="다시 시도"
          onPress={onRetry}
          title="다시 시도"
          variant="soft"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.card,
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 180,
    padding: theme.spacing.lg,
  },
  title: { ...theme.typography.heading, color: theme.colors.text, textAlign: "center" },
  message: { ...theme.typography.body, color: theme.colors.muted, textAlign: "center" },
}));

export default ContentState;
