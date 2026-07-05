import { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { ProfilePlanCard } from "./profile-plan-card";
import { SubscriptionPlan } from "./types";

type ProfilePlanCarouselProps = {
  plans: SubscriptionPlan[];
};

export const ProfilePlanCarousel = ({ plans }: ProfilePlanCarouselProps) => {
  const planScrollViewRef = useRef<ScrollView>(null);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [planSectionWidth, setPlanSectionWidth] = useState(0);
  const planSlideWidth = planSectionWidth * 0.96;
  const planSnapWidth = planSlideWidth + 4;

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

  if (plans.length === 0) {
    return null;
  }

  return (
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
        {plans.map((plan) => (
          <View key={plan.id} style={[styles.planSlide, { width: planSlideWidth }]}>
            <ProfilePlanCard plan={plan} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.planDots}>
        {plans.map((plan, index) => (
          <Pressable
            key={`dot-${plan.id}`}
            accessibilityRole="button"
            onPress={() => setPlanIndex(index)}
            style={[styles.planDot, activePlanIndex === index && styles.planDotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  planScroller: {
    width: "100%",
  },
  planSection: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  planSlide: {
    marginHorizontal: 2,
  },
});
