import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { SubscriptionPlan } from "../types";

type ProfilePlanCardProps = {
  plan: SubscriptionPlan;
};

export const ProfilePlanCard = ({ plan }: ProfilePlanCardProps) => {
  return (
    <View style={[styles.planBox, getPlanBoxStyle(plan.name)]}>
      <View style={styles.planHeader}>
        <View style={styles.planBrand}>
          <Text style={[styles.planName, plan.name === "Black" && styles.blackPlanText]}>
            {plan.name}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={`${plan.name} 플랜으로 업그레이드`}
          accessibilityRole="button"
          style={[styles.upgradePill, getUpgradePillStyle(plan.name)]}
        >
          <Text
            style={[
              styles.upgradePillText,
              plan.name === "Basic" && styles.basicUpgradePillText,
              plan.name === "Black" && styles.blackUpgradePillText,
            ]}
          >
            업그레이드
          </Text>
        </Pressable>
      </View>

      <View style={styles.compareTable}>
        <View style={styles.compareHeader}>
          <Text style={styles.compareTitle} />
          <Text style={[styles.compareColumn, plan.name === "Black" && styles.blackPlanText]}>
            무료
          </Text>
          <Text style={[styles.compareColumn, plan.name === "Black" && styles.blackPlanText]}>
            {plan.name}
          </Text>
        </View>
        {plan.benefits.slice(0, 3).map((benefit) => (
          <View key={benefit} style={styles.compareRow}>
            <Text style={[styles.compareFeature, plan.name === "Black" && styles.blackPlanText]}>
              {benefit}
            </Text>
            <Text style={styles.compareIcon}>🔒</Text>
            <Text style={[styles.compareIcon, plan.name === "Black" && styles.blackCheckIcon]}>
              ✓
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.moreFeatures, plan.name === "Black" && styles.blackPlanText]}>
        기능 모두 보기
      </Text>
    </View>
  );
};

const getPlanBoxStyle = (planName: string) => {
  switch (planName.toLowerCase()) {
    case "basic":
      return styles.basicPlanBox;
    case "gold":
      return styles.goldPlanBox;
    case "black":
      return styles.blackPlanBox;
    default:
      return styles.basicPlanBox;
  }
};

const getUpgradePillStyle = (planName: string) => {
  switch (planName.toLowerCase()) {
    case "basic":
      return styles.basicUpgradePill;
    case "gold":
      return styles.goldUpgradePill;
    case "black":
      return styles.blackUpgradePill;
    default:
      return styles.basicUpgradePill;
  }
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  basicPlanBox: {
    backgroundColor: theme.colors.planBasic,
    borderColor: theme.colors.planBasicBorder,
  },
  basicUpgradePill: {
    backgroundColor: theme.colors.primary,
  },
  basicUpgradePillText: {
    color: theme.colors.primaryText,
  },
  blackCheckIcon: {
    color: theme.colors.muted,
  },
  blackPlanBox: {
    backgroundColor: theme.colors.planBlack,
    borderColor: theme.colors.border,
    borderWidth: 1.5,
  },
  blackPlanText: {
    color: theme.colors.primaryText,
  },
  blackUpgradePill: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  blackUpgradePillText: {
    color: theme.colors.text,
  },
  compareColumn: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    width: 44,
  },
  compareFeature: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  compareHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  compareIcon: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    width: 44,
  },
  compareRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  compareTable: {
    gap: theme.spacing.md,
  },
  compareTitle: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  goldPlanBox: {
    backgroundColor: theme.colors.planGold,
    borderColor: theme.colors.planGoldBorder,
  },
  goldUpgradePill: {
    backgroundColor: theme.colors.accent,
  },
  moreFeatures: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  planBox: {
    backgroundColor: theme.colors.planGold,
    borderColor: theme.colors.planGoldBorder,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    gap: theme.spacing.md,
    minHeight: 276,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    width: "100%",
  },
  planBrand: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  planHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  planName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  upgradePill: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  upgradePillText: {
    color: theme.colors.accentText,
    fontSize: 14,
    fontWeight: "900",
  },
}));
