import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeCard } from "@/shared/components";

import type { BillingOverviewCardProps } from "../types";
const BillingOverviewCard = ({
  balance,
  subscription,
  revenueCat,
  reconciliationPending,
}: BillingOverviewCardProps) => {
  return (
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
  );
};
const styles = StyleSheet.create((theme) => ({
  statusText: { color: theme.colors.primary, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
}));
export default BillingOverviewCard;
