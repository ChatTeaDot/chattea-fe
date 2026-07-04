import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { colors, spacing } from "@/theme/tokens";

import { useMySubscription, useSubscriptionPlans } from "./hooks";

const oneTimePurchases = [
  { name: "부스트", action: "구매하기" },
  { name: "슈퍼라이크", action: "구매하기" },
  { name: "구독 서비스" },
];

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

export const ProfileScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const planScrollViewRef = useRef<ScrollView>(null);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [planSectionWidth, setPlanSectionWidth] = useState(0);
  const subscription = useMySubscription();
  const plans = useSubscriptionPlans();
  const upgradePlans = (plans.data ?? []).filter(
    (plan) =>
      plan.id !== "free" &&
      plan.name !== "Free" &&
      plan.id !== subscription.data?.planId,
  );
  const planSlideWidth = planSectionWidth * 0.96;
  const planSnapWidth = planSlideWidth + 4;

  const scrollToPlans = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const setPlanIndex = (index: number) => {
    setActivePlanIndex(index);
    planScrollViewRef.current?.scrollTo({
      x: index * planSnapWidth,
      animated: true,
    });
  };

  const updatePlanIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (planSnapWidth > 0) {
      setActivePlanIndex(Math.round(event.nativeEvent.contentOffset.x / planSnapWidth));
    }
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>C</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>ChatTea User</Text>
              <Pressable accessibilityRole="button" style={styles.editButton}>
                <Text style={styles.editText}>프로필 수정</Text>
              </Pressable>
            </View>
          </View>
          <Pressable accessibilityLabel="설정" accessibilityRole="button" style={styles.iconButton}>
            <Text style={styles.iconText}>•••</Text>
          </Pressable>
        </View>

        <View style={styles.purchaseGrid}>
          {oneTimePurchases.map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              onPress={item.name === "구독 서비스" ? scrollToPlans : undefined}
              style={styles.purchaseBox}
            >
              <Text style={styles.plusIcon}>+</Text>
              <View style={styles.purchaseText}>
                <Text style={styles.purchaseName}>{item.name}</Text>
                {item.action ? <Text style={styles.purchaseAction}>{item.action}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>

        {upgradePlans.length > 0 ? (
          <View
            onLayout={(event) => setPlanSectionWidth(event.nativeEvent.layout.width)}
            style={styles.planSection}
          >
            <ScrollView
              ref={planScrollViewRef}
              decelerationRate="fast"
              horizontal
              onMomentumScrollEnd={updatePlanIndex}
              showsHorizontalScrollIndicator={false}
              snapToInterval={planSnapWidth}
              style={styles.planScroller}
            >
              {upgradePlans.map((plan) => (
                <View key={plan.id} style={[styles.planSlide, { width: planSlideWidth }]}>
                  <View style={[styles.planBox, getPlanBoxStyle(plan.name)]}>
                    <View style={styles.planHeader}>
                      <View style={styles.planBrand}>
                        <Text
                          style={[
                            styles.planName,
                            plan.name === "Black" && styles.blackPlanText,
                          ]}
                        >
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
                        <Text
                          style={[
                            styles.compareColumn,
                            plan.name === "Black" && styles.blackPlanText,
                          ]}
                        >
                          무료
                        </Text>
                        <Text
                          style={[
                            styles.compareColumn,
                            plan.name === "Black" && styles.blackPlanText,
                          ]}
                        >
                          {plan.name}
                        </Text>
                      </View>
                      {plan.benefits.slice(0, 3).map((benefit) => (
                        <View key={benefit} style={styles.compareRow}>
                          <Text
                            style={[
                              styles.compareFeature,
                              plan.name === "Black" && styles.blackPlanText,
                            ]}
                          >
                            {benefit}
                          </Text>
                          <Text style={styles.compareIcon}>🔒</Text>
                          <Text
                            style={[
                              styles.compareIcon,
                              plan.name === "Black" && styles.blackCheckIcon,
                            ]}
                          >
                            ✓
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.moreFeatures,
                        plan.name === "Black" && styles.blackPlanText,
                      ]}
                    >
                      기능 모두 보기
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.planDots}>
              {upgradePlans.map((plan, index) => (
                <Pressable
                  key={`dot-${plan.id}`}
                  accessibilityRole="button"
                  onPress={() => setPlanIndex(index)}
                  style={[styles.planDot, activePlanIndex === index && styles.planDotActive]}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  benefit: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  benefitIcon: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    width: 18,
  },
  benefitRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  benefits: {
    gap: spacing.xs,
  },
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
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  goldPlanBox: {
    backgroundColor: "#fff4cc",
    borderColor: "#e7bc45",
  },
  goldUpgradePill: {
    backgroundColor: "#f5c84c",
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
  editButton: {
    alignSelf: "flex-start",
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
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
  planBadge: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.xs,
  },
  planBrand: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  planDot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  planDotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  planDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  planFlame: {
    color: colors.accent,
    fontSize: 18,
  },
  planHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  planSection: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  planScroller: {
    width: "100%",
  },
  planSlide: {
    marginHorizontal: 2,
  },
  planName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  moreFeatures: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  profile: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  profileText: {
    gap: spacing.xs,
  },
  purchaseAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  purchaseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  plusIcon: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    height: 24,
    lineHeight: 22,
    position: "absolute",
    right: -spacing.xs,
    textAlign: "center",
    top: -spacing.xs,
    width: 24,
    zIndex: 1,
  },
  purchaseBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 88,
    overflow: "visible",
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  purchaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  purchaseText: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
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
