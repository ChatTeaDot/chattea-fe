import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { RoundActionButtonProps } from "../types";

const RoundActionButton = ({ disabled, icon, label, main, onPress }: RoundActionButtonProps) => {
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
      {icon}
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
  pressed: {
    opacity: 0.62,
  },
}));

export default RoundActionButton;
