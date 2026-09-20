import { router } from "expo-router";
import { Crown } from "lucide-react-native";
import { Pressable, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PLAN_BADGE_LABELS } from "../constants";
import type { PlanBadgeProps } from "../types";

const PlanBadge = ({ planId }: PlanBadgeProps) => {
  const { theme } = useUnistyles();
  if (!planId || planId === "free") return null;
  return (
    <Pressable
      accessibilityLabel="내 플랜 보기"
      accessibilityRole="button"
      onPress={() => router.push("/premium")}
      style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}
    >
      <Crown color={theme.colors.accent} size={16} strokeWidth={1.5} />
      <Text style={styles.badgeText}>{PLAN_BADGE_LABELS[planId]}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.pill,
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.screen,
    paddingHorizontal: theme.spacing.control,
    paddingVertical: 6,
  },
  badgePressed: {
    opacity: 0.72,
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
}));

export default PlanBadge;
