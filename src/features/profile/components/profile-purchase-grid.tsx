import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

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

const styles = StyleSheet.create((theme: AppTheme) => ({
  plusIcon: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "900",
    height: 24,
    lineHeight: 22,
    position: "absolute",
    right: -theme.spacing.xs,
    textAlign: "center",
    top: -theme.spacing.xs,
    width: 24,
    zIndex: 1,
  },
  purchaseAction: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  purchaseBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 88,
    overflow: "visible",
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  purchaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  purchaseName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  purchaseText: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
}));
