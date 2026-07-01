import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "soft";
};

export const AppButton = ({
  title,
  onPress,
  disabled = false,
  variant = "filled",
}: AppButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, variant === "soft" && styles.soft, disabled && styles.disabled]}
    >
      <Text style={[styles.text, variant === "soft" && styles.softText]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "800",
  },
  softText: {
    color: colors.primary,
  },
});
