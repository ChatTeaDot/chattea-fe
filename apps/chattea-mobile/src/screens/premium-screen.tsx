import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import {
  type CurrentSubscription,
  PLAN_CARDS,
  PlanCard,
  usePremiumBilling,
} from "@/features/billing";
import { AppButton, BottomCta, NativeScreen } from "@/shared/components";

const PremiumScreen = () => {
  const {
    products,
    revenueCat,
    pending,
    backendStateUnavailable,
    reconciliationPending,
    purchase,
    restore,
  } = usePremiumBilling();
  const [selectedPlanId, setSelectedPlanId] = useState<CurrentSubscription["planId"]>("gold");
  const selected = PLAN_CARDS.find((card) => card.planId === selectedPlanId) ?? PLAN_CARDS[2];
  const selectedProduct = products.data?.billingProducts.find(
    (product) => product.id === selected.productId,
  );
  const storeUnavailable =
    pending ||
    backendStateUnavailable ||
    reconciliationPending ||
    products.loading ||
    Boolean(products.error) ||
    revenueCat.state.status !== "ready";
  const subscribeDisabled =
    !selected.productId ||
    !selectedProduct ||
    storeUnavailable ||
    (revenueCat.state.status === "ready" && !revenueCat.state.packages[selectedProduct.id]);
  return (
    <NativeScreen>
      <ScrollView
        automaticallyAdjustsScrollIndicatorInsets
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {PLAN_CARDS.map((card) => (
          <PlanCard
            card={card}
            disabled={pending}
            key={card.planId}
            onPress={() => setSelectedPlanId(card.planId)}
            price={
              card.productId && revenueCat.state.status === "ready"
                ? revenueCat.state.packages[card.productId]?.priceString
                : undefined
            }
            selected={card.planId === selectedPlanId}
          />
        ))}
        <Text style={styles.notice}>매달 자동 갱신 · 언제든 해지</Text>
        {revenueCat.state.status === "disabled" || revenueCat.state.status === "error" ? (
          <Text style={styles.notice}>{revenueCat.state.message}</Text>
        ) : reconciliationPending ? (
          <Text style={styles.notice}>스토어 구매를 서버 계정에 반영하고 있어요.</Text>
        ) : null}
      </ScrollView>
      <BottomCta>
        <AppButton
          disabled={subscribeDisabled}
          onPress={() => selectedProduct && void purchase(selectedProduct)}
          title={`${selected.name} 구독하기`}
        />
        <Pressable
          accessibilityRole="button"
          disabled={pending || reconciliationPending || revenueCat.state.status !== "ready"}
          onPress={() => void restore()}
          style={({ pressed }) => [styles.restore, pressed && styles.restorePressed]}
        >
          <Text style={styles.restoreText}>이전 구매 복원</Text>
        </Pressable>
      </BottomCta>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  notice: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  restore: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  restorePressed: {
    opacity: 0.62,
  },
  restoreText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
}));

export default PremiumScreen;
