import { Platform, Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, minimumTouchTarget, radii, spacing } from "@/theme/tokens";

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
      android_ripple={{ color: "#ffffff33" }}
      style={({ pressed }) => [
        styles.button,
        variant === "soft" && styles.soft,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, variant === "soft" && styles.softText]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.cta,
    minHeight: Math.max(52, minimumTouchTarget),
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.72 : 1,
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
