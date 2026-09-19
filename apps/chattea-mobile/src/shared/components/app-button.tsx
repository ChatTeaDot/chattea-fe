import { Platform, Pressable, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "soft" | "text";
  accessibilityLabel?: string;
};

const AppButton = ({
  title,
  onPress,
  disabled = false,
  variant = "filled",
  accessibilityLabel,
}: AppButtonProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: theme.colors.ripple }}
      style={({ pressed }) => [
        styles.button,
        variant === "soft" && styles.soft,
        variant === "outlined" && styles.outlined,
        variant === "text" && styles.textButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, variant !== "filled" && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.cta,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  soft: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  outlined: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  textButton: {
    backgroundColor: theme.colors.transparent,
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.72 : 1,
  },
  text: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryText: {
    color: theme.colors.primary,
  },
}));

export default AppButton;
