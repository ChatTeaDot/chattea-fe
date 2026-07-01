import { LegendList } from "@legendapp/list/react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { spacing } from "@/theme/tokens";

import { useSubscriptionPlans } from "./hooks";
import { PlanCard } from "./plan-card";
import { PlanHeader } from "./plan-header";

export const PlanScreen = () => {
  const plans = useSubscriptionPlans();

  return (
    <Screen>
      <PlanHeader />
      <LegendList
        recycleItems={false}
        data={plans.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlanCard plan={item} />}
        contentContainerStyle={styles.list}
        style={styles.listFrame}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});
