import { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { ContentState, getContentViewState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

import { ProfilePlanCarousel, ProfilePurchaseGrid, ProfileSummary } from "./components";
import { useMySubscription } from "./hooks";
import { SUBSCRIPTION_PLANS } from "./types";

export const ProfileScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const reducedMotion = useReducedMotion();
  const subscription = useMySubscription();
  const upgradePlans = SUBSCRIPTION_PLANS.filter(
    (plan) => plan.id !== "free" && plan.name !== "Free" && plan.id !== subscription.data?.planId,
  );
  const state = getContentViewState(
    subscription.loading,
    Boolean(subscription.error),
    SUBSCRIPTION_PLANS.length,
  );

  const retry = () => {
    void subscription.refetch().catch(() => undefined);
  };

  const scrollToPlans = () => {
    scrollViewRef.current?.scrollToEnd({ animated: !reducedMotion });
  };

  if (state === "loading")
    return (
      <Screen>
        <ContentState kind="loading" title="프로필을 준비하고 있어요" />
      </Screen>
    );
  if (state === "error")
    return (
      <Screen>
        <ContentState kind="error" onRetry={retry} />
      </Screen>
    );
  if (state === "empty")
    return (
      <Screen>
        <ContentState
          kind="empty"
          title="이용 가능한 플랜이 없어요"
          message="새로운 플랜을 준비하고 있어요."
        />
      </Screen>
    );

  return (
    <Screen>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View accessible accessibilityLabel="내 프로필" style={styles.hero}>
          <Text style={styles.eyebrow}>MY CHATTEA</Text>
          <ProfileSummary />
          <Text style={styles.description}>나답게 연결되고, 더 깊은 대화를 시작해 보세요.</Text>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            프로필 도구
          </Text>
          <ProfilePurchaseGrid onSubscriptionPress={scrollToPlans} />
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            나에게 맞는 플랜
          </Text>
          <ProfilePlanCarousel plans={upgradePlans} />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  content: { flexGrow: 1, gap: theme.spacing.lg, paddingBottom: theme.spacing.sm },
  hero: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.card,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  eyebrow: { color: theme.colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
  description: { ...theme.typography.body, color: theme.colors.muted },
  section: { gap: theme.spacing.md },
  sectionTitle: { ...theme.typography.heading, color: theme.colors.text },
}));
