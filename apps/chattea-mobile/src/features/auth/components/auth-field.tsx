import { Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import type { AuthFieldProps } from "../types";

const AuthField = ({ label, ...props }: AuthFieldProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={theme.colors.muted}
        selectionColor={theme.colors.accent}
        style={styles.input}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  wrap: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    color: theme.colors.text,
    fontSize: 14,
    minHeight: theme.sizes.tapMin,
    paddingHorizontal: theme.spacing.md,
  },
}));

export default AuthField;
