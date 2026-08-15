import { ActivityIndicator, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { AppButton } from "./app-button";

type ContentStateProps = {
  kind: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export const ContentState = ({ kind, title, message, onRetry }: ContentStateProps) => {
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

const defaultCopy = {
  loading: { title: "불러오고 있어요", message: "잠시만 기다려 주세요." },
  empty: {
    title: "아직 보여드릴 내용이 없어요",
    message: "새 소식이 생기면 이곳에서 알려드릴게요.",
  },
  error: { title: "내용을 불러오지 못했어요", message: "연결을 확인한 뒤 다시 시도해 주세요." },
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
