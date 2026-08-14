import { ActivityIndicator, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, radii, spacing, typography } from "@/theme/tokens";

type ContentStateProps = { kind: "loading" | "empty" | "error"; title?: string; message?: string };

export const ContentState = ({ kind, title, message }: ContentStateProps) => (
  <View accessibilityRole={kind === "error" ? "alert" : "summary"} style={styles.container}>
    {kind === "loading" ? <ActivityIndicator color={colors.primary} /> : null}
    <Text style={styles.title}>{title ?? defaultCopy[kind].title}</Text>
    <Text style={styles.message}>{message ?? defaultCopy[kind].message}</Text>
  </View>
);

const defaultCopy = {
  loading: { title: "불러오고 있어요", message: "잠시만 기다려 주세요." },
  empty: {
    title: "아직 보여드릴 내용이 없어요",
    message: "새 소식이 생기면 이곳에서 알려드릴게요.",
  },
  error: { title: "내용을 불러오지 못했어요", message: "연결을 확인한 뒤 다시 시도해 주세요." },
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.card,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 180,
    padding: spacing.lg,
  },
  title: { ...typography.heading, color: colors.text, textAlign: "center" },
  message: { ...typography.body, color: colors.muted, textAlign: "center" },
});
