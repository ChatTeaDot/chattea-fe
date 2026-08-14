import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { SubscriptionPlan } from "../types";

type PlanCardProps = {
  plan: SubscriptionPlan;
};

export const PlanCard = ({ plan }: PlanCardProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.planTitle}>
        <Text style={styles.name}>{plan.name}</Text>
        <Text style={styles.price}>{formatPrice(plan.monthlyPriceKrw)}</Text>
      </View>
      {plan.benefits.map((benefit) => (
        <Text key={benefit} style={styles.benefit}>
          {benefit}
        </Text>
      ))}
    </View>
  );
};

const formatPrice = (price: number): string => {
  return price === 0 ? "무료" : `월 ${price.toLocaleString("ko-KR")}원`;
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  row: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  planTitle: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  price: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  benefit: {
    color: theme.colors.muted,
    fontSize: 14,
  },
}));
