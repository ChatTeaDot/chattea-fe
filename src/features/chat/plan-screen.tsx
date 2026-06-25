import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../shared/components/screen";
import { colors, spacing } from "../../theme/tokens";
import { useSubscriptionPlans } from "./hooks";
import { SubscriptionPlan } from "./types";

export function PlanScreen() {
  const plans = useSubscriptionPlans();

  function renderPlan({ item }: { item: SubscriptionPlan }) {
    return (
      <View style={styles.row}>
        <View style={styles.planTitle}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{formatPrice(item.monthlyPriceKrw)}</Text>
        </View>
        {item.benefits.map((benefit) => (
          <Text key={benefit} style={styles.benefit}>
            {benefit}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>플랜</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.link}>닫기</Text>
        </Pressable>
      </View>
      <LegendList
        data={plans.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderPlan}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

function formatPrice(price: number): string {
  return price === 0 ? "무료" : `월 ${price.toLocaleString("ko-KR")}원`;
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    borderColor: colors.border,
    borderRadius: 8,
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
