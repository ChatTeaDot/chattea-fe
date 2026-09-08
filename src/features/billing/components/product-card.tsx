import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { ProductCardProps } from "../types";

const ProductCard = ({ disabled, onPress, price, product }: ProductCardProps) => {
  return (
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
export default ProductCard;
