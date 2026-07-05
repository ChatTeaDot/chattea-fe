import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { SubscriptionPlan } from "./types";

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

const styles = StyleSheet.create({
  basicPlanBox: {
    backgroundColor: "#e8f2ff",
    borderColor: "#9cc6ff",
  },
  basicUpgradePill: {
    backgroundColor: "#2478ff",
  },
  basicUpgradePillText: {
    color: colors.surface,
  },
  blackCheckIcon: {
    color: "#a9afba",
  },
  blackPlanBox: {
    backgroundColor: "#07080b",
    borderColor: "#3a3f49",
    borderWidth: 1.5,
  },
  blackPlanText: {
    color: "#f8f1dc",
  },
  blackUpgradePill: {
    backgroundColor: "#20242c",
    borderColor: "#505664",
    borderWidth: 1,
  },
  blackUpgradePillText: {
    color: colors.surface,
  },
  compareColumn: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    width: 44,
  },
  compareFeature: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  compareHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  compareIcon: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    width: 44,
  },
  compareRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  compareTable: {
    gap: spacing.md,
  },
  compareTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  goldPlanBox: {
    backgroundColor: "#fff4cc",
    borderColor: "#e7bc45",
  },
  goldUpgradePill: {
    backgroundColor: "#f5c84c",
  },
  moreFeatures: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  planBox: {
    backgroundColor: "#fff7d8",
    borderColor: "#f2cf6d",
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 276,
    padding: spacing.lg,
    paddingBottom: spacing.md,
    width: "100%",
  },
  planBrand: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  planHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  planName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  upgradePill: {
    backgroundColor: "#ffe07a",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  upgradePillText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
});
