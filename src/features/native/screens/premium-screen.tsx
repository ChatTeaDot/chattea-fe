import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  BILLING_PRODUCTS_QUERY,
  type BillingProduct,
  CONSUMABLE_BALANCE_QUERY,
  type ConsumableBalance,
  CURRENT_SUBSCRIPTION_QUERY,
  type CurrentSubscription,
  useRevenueCat,
} from "@/features/native/billing";
import {
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "@/features/native/components";

import { showActionError, styles } from "./screen-shared";

export const PremiumScreen = () => {
  const products = useQuery<{ billingProducts: BillingProduct[] }>(BILLING_PRODUCTS_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  const subscription = useQuery<{ currentSubscription: CurrentSubscription }>(
    CURRENT_SUBSCRIPTION_QUERY,
  );
  const revenueCat = useRevenueCat();
  const [pending, setPending] = useState(false);
  const backendStateUnavailable =
    balance.loading ||
    subscription.loading ||
    Boolean(balance.error) ||
    Boolean(subscription.error) ||
    !balance.data ||
    !subscription.data;
  const reconciliationPending =
    revenueCat.state.status === "ready" && revenueCat.state.reconciliationPending;
  const purchase = async (product: BillingProduct) => {
    setPending(true);
    try {
      const result = await revenueCat.purchase(product.id);
      if (result === "purchased") {
        Alert.alert("구매를 확인하고 있어요", "스토어 처리가 끝나면 혜택이 자동으로 반영돼요.");
      }
    } catch (error) {
      showActionError(error);
    } finally {
      setPending(false);
    }
  };
  const restore = async () => {
    setPending(true);
    try {
      const result = await revenueCat.restore();
      if (result === "restored") {
        Alert.alert("구매 복원을 요청했어요", "복원된 혜택을 계정에서 다시 확인할게요.");
      }
    } catch (error) {
      showActionError(error);
    } finally {
      setPending(false);
    }
  };
  const grouped = useMemo(() => {
    const all = products.data?.billingProducts ?? [];
    return {
      subscriptions: all.filter((item) => item.kind === "subscription"),
      items: all.filter((item) => item.kind !== "subscription"),
    };
  }, [products.data?.billingProducts]);
  return (
    <NativeScreen>
      <NativeScroll>
        <NativeCard>
          <Text style={styles.postTitle}>더 넓게, 더 편하게 만나 보세요</Text>
          <MetaText>구독과 아이템 결제는 앱 스토어 결제를 통해 안전하게 처리돼요.</MetaText>
          <Text style={styles.statusText}>
            보유 슈퍼라이크 {balance.data?.consumableBalance.superLikeCredits ?? 0}개, 부스트{" "}
            {balance.data?.consumableBalance.boostCredits ?? 0}회
          </Text>
          <MetaText>현재 플랜: {subscription.data?.currentSubscription.planId ?? "free"}</MetaText>
          {revenueCat.state.status === "disabled" || revenueCat.state.status === "error" ? (
            <MetaText>{revenueCat.state.message}</MetaText>
          ) : revenueCat.state.status === "loading" ? (
            <MetaText>스토어 결제 정보를 불러오고 있어요.</MetaText>
          ) : reconciliationPending ? (
            <MetaText>스토어 구매를 서버 계정에 반영하고 있어요.</MetaText>
          ) : null}
        </NativeCard>
        <SectionHeading title="구독" />
        {grouped.subscriptions.map((product) => (
          <ProductCard
            disabled={
              pending ||
              backendStateUnavailable ||
              reconciliationPending ||
              products.loading ||
              Boolean(products.error) ||
              revenueCat.state.status !== "ready" ||
              !revenueCat.state.packages[product.id]
            }
            key={product.id}
            onPress={() => void purchase(product)}
            price={
              revenueCat.state.status === "ready"
                ? revenueCat.state.packages[product.id]?.priceString
                : undefined
            }
            product={product}
          />
        ))}
        <SectionHeading title="아이템" />
        {grouped.items.map((product) => (
          <ProductCard
            disabled={
              pending ||
              backendStateUnavailable ||
              reconciliationPending ||
              products.loading ||
              Boolean(products.error) ||
              revenueCat.state.status !== "ready" ||
              !revenueCat.state.packages[product.id]
            }
            key={product.id}
            onPress={() => void purchase(product)}
            price={
              revenueCat.state.status === "ready"
                ? revenueCat.state.packages[product.id]?.priceString
                : undefined
            }
            product={product}
          />
        ))}
        <NativeButton
          disabled={
            pending ||
            backendStateUnavailable ||
            reconciliationPending ||
            revenueCat.state.status !== "ready"
          }
          label="구매 복원"
          onPress={() => void restore()}
          tone="secondary"
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

const ProductCard = ({
  disabled,
  onPress,
  price,
  product,
}: {
  disabled: boolean;
  onPress: () => void;
  price?: string;
  product: BillingProduct;
}) => (
  <NativeCard>
    <View style={styles.roomRow}>
      <View style={styles.roomText}>
        <Text style={styles.postTitle}>{product.name}</Text>
        <MetaText>
          {product.kind === "subscription" ? "매월 자동 갱신" : "필요할 때 한 번만 사용"}
        </MetaText>
        <MetaText>{price ?? "현재 스토어에서 구매할 수 없는 상품이에요."}</MetaText>
      </View>
    </View>
    <NativeButton disabled={disabled} label="구매하기" onPress={onPress} fullWidth />
  </NativeCard>
);
