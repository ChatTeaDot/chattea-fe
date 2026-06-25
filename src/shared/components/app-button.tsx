import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../../theme/tokens";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AppButton({ title, onPress, disabled = false }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
