import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

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

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  planTitle: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  price: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  benefit: {
    color: colors.muted,
    fontSize: 14,
  },
});
