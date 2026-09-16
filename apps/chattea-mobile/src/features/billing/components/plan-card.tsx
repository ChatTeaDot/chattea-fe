import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PlanCardProps } from "../types";

const PlanCard = ({ card, disabled, onPress, price, selected }: PlanCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHead}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardPrice}>{price ?? card.fallbackPrice}</Text>
      </View>
      <Text style={styles.cardDesc}>{card.description}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.transparent,
    borderRadius: theme.radii.xl,
    borderWidth: 1.5,
    marginBottom: theme.spacing.control,
    marginHorizontal: theme.spacing.screen,
    padding: theme.spacing.md,
  },
  cardSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  cardPrice: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  cardDesc: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
}));

export default PlanCard;
