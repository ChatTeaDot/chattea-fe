import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { CreditBalanceCardProps } from "../types";
const CreditBalanceCard = ({ balance, onViewPlans }: CreditBalanceCardProps) => {
  return (
    <NativeCard>
      <View style={styles.roomRow}>
        <View style={styles.roomText}>
          <Text style={styles.postTitle}>
            슈퍼라이크 {balance.data?.consumableBalance.superLikeCredits ?? 0}개
          </Text>
          <MetaText>부스트 {balance.data?.consumableBalance.boostCredits ?? 0}회</MetaText>
        </View>
        <NativeButton label="이용권 보기" onPress={onViewPlans} tone="quiet" />
      </View>
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  roomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  roomText: { flex: 1, gap: theme.spacing.xs },
}));
export default CreditBalanceCard;
