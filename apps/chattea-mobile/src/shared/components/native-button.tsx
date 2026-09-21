import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeButton = ({
  label,
  onPress,
  disabled = false,
  tone = "primary",
  fullWidth = false,
}: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonToneStyle(tone),
        fullWidth && styles.buttonWide,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, buttonTextToneStyle(tone)]}>{label}</Text>
    </Pressable>
  );
};
type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "quiet" | "danger";
  fullWidth?: boolean;
};
const buttonToneStyle = (tone: NonNullable<ButtonProps["tone"]>) => {
  if (tone === "secondary") return styles.buttonSecondary;
  if (tone === "quiet") return styles.buttonQuiet;
  if (tone === "danger") return styles.buttonDanger;
  return styles.buttonPrimary;
};
const buttonTextToneStyle = (tone: NonNullable<ButtonProps["tone"]>) => {
  if (tone === "secondary") return styles.buttonTextSecondary;
  if (tone === "quiet") return styles.buttonTextQuiet;
  if (tone === "danger") return styles.buttonTextDanger;
  return styles.buttonTextPrimary;
};
const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonWide: {
    alignSelf: "stretch",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  buttonQuiet: {
    backgroundColor: "transparent",
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
  },
  buttonPressed: {
    opacity: 0.62,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: theme.colors.primaryText,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
  buttonTextQuiet: {
    color: theme.colors.primary,
  },
  buttonTextDanger: {
    color: theme.colors.primaryText,
  },
}));

export default NativeButton;
