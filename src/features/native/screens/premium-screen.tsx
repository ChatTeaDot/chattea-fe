import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { Alert, Text, View } from "react-native";

import {
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "../components";
import { BILLING_PRODUCTS_QUERY, CONSUMABLE_BALANCE_QUERY } from "../operations";
import type { BillingProduct, ConsumableBalance } from "../types";
import { styles } from "./screen-shared";

export const PremiumScreen = () => {
  const products = useQuery<{ billingProducts: BillingProduct[] }>(BILLING_PRODUCTS_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  const purchase = (product: BillingProduct) => {
    Alert.alert(
      "결제를 준비하고 있어요",
      `${product.name} 결제는 RevenueCat이 연결된 실제 앱 빌드에서 진행할 수 있어요. 현재 환경에는 해당 네이티브 결제 모듈이 설정되지 않았어요.`,
    );
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
        </NativeCard>
        <SectionHeading title="구독" />
        {grouped.subscriptions.map((product) => (
          <ProductCard key={product.id} product={product} onPress={() => purchase(product)} />
        ))}
        <SectionHeading title="아이템" />
        {grouped.items.map((product) => (
          <ProductCard key={product.id} product={product} onPress={() => purchase(product)} />
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

const ProductCard = ({ product, onPress }: { product: BillingProduct; onPress: () => void }) => (
  <NativeCard>
    <View style={styles.roomRow}>
      <View style={styles.roomText}>
        <Text style={styles.postTitle}>{product.name}</Text>
        <MetaText>
          {product.kind === "subscription" ? "매월 자동 갱신" : "필요할 때 한 번만 사용"}
        </MetaText>
        <MetaText>가격은 앱 스토어에서 확인할 수 있어요.</MetaText>
      </View>
    </View>
    <NativeButton label="구매하기" onPress={onPress} fullWidth />
  </NativeCard>
);
