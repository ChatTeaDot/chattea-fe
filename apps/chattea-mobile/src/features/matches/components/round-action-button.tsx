import { Image } from "expo-image";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import type { RoundActionButtonProps } from "../types";

const RoundActionButton = ({ disabled, icon, label, main, onPress }: RoundActionButtonProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        main ? styles.main : styles.side,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <Image
        source={icon}
        style={main ? styles.mainIcon : styles.sideIcon}
        tintColor={main ? theme.colors.primaryText : theme.colors.muted}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: theme.radii.pill,
    justifyContent: "center",
  },
  side: {
    backgroundColor: theme.colors.background,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    height: 56,
    width: 56,
  },
  main: {
    backgroundColor: theme.colors.accent,
    boxShadow: "0 4px 16px rgba(236,72,153,0.4)",
    height: 68,
    width: 68,
  },
  sideIcon: {
    height: 24,
    width: 24,
  },
  mainIcon: {
    height: 28,
    width: 28,
  },
  pressed: {
    opacity: 0.62,
  },
}));

export default RoundActionButton;
