import { useRef } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components";
import { spacing } from "@/theme/tokens";

import { useMySubscription, useSubscriptionPlans } from "./hooks";
import { ProfilePlanCarousel } from "./profile-plan-carousel";
import { ProfilePurchaseGrid } from "./profile-purchase-grid";
import { ProfileSummary } from "./profile-summary";

export const ProfileScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const subscription = useMySubscription();
  const plans = useSubscriptionPlans();
  const upgradePlans = (plans.data ?? []).filter(
    (plan) => plan.id !== "free" && plan.name !== "Free" && plan.id !== subscription.data?.planId,
  );

  const scrollToPlans = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSummary />
        <ProfilePurchaseGrid onSubscriptionPress={scrollToPlans} />
        <ProfilePlanCarousel plans={upgradePlans} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
});
