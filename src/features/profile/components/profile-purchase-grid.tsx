import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

type ProfilePurchaseGridProps = {
  onSubscriptionPress: () => void;
};

const oneTimePurchases = [
  { name: "부스트", action: "구매하기" },
  { name: "슈퍼라이크", action: "구매하기" },
  { name: "구독 서비스" },
];

export const ProfilePurchaseGrid = ({ onSubscriptionPress }: ProfilePurchaseGridProps) => {
  return (
    <View style={styles.purchaseGrid}>
      {oneTimePurchases.map((item) => (
        <Pressable
          key={item.name}
          accessibilityRole="button"
          onPress={item.name === "구독 서비스" ? onSubscriptionPress : undefined}
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
  );
};

const styles = StyleSheet.create({
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
  purchaseAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
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
  purchaseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  purchaseText: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
  },
});
