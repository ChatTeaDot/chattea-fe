import { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { SubscriptionPlan } from "../types";
import { ProfilePlanCard } from "./profile-plan-card";

type ProfilePlanCarouselProps = {
  plans: SubscriptionPlan[];
};

export const ProfilePlanCarousel = ({ plans }: ProfilePlanCarouselProps) => {
  const planScrollViewRef = useRef<ScrollView>(null);
  const reducedMotion = useReducedMotion();
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [planSectionWidth, setPlanSectionWidth] = useState(0);
  const planSlideWidth = planSectionWidth * 0.96;
  const planSnapWidth = planSlideWidth + 4;

  const setPlanIndex = (index: number) => {
    setActivePlanIndex(index);
    planScrollViewRef.current?.scrollTo({
      x: index * planSnapWidth,
      animated: !reducedMotion,
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
          <View key={plan.id} style={styles.planSlide(planSlideWidth)}>
            <ProfilePlanCard plan={plan} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.planDots}>
        {plans.map((plan, index) => (
          <Pressable
            key={`dot-${plan.id}`}
            accessibilityLabel={`${plan.name} 플랜 보기`}
            accessibilityRole="button"
            accessibilityState={{ selected: activePlanIndex === index }}
            onPress={() => setPlanIndex(index)}
            style={styles.planDotButton}
          >
            <View style={[styles.planDot, activePlanIndex === index && styles.planDotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  planDot: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    height: 6,
    width: 6,
  },
  planDotActive: {
    backgroundColor: theme.colors.primary,
    width: 18,
  },
  planDotButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  planDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  planScroller: {
    width: "100%",
  },
  planSection: {
    alignItems: "center",
    gap: theme.spacing.sm,
    width: "100%",
  },
  planSlide: (width: number) => ({
    marginHorizontal: 2,
    width,
  }),
}));
