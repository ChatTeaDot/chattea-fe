import { Text, TextInput, TextInputProps, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

type AppInputProps = TextInputProps & {
  label: string;
};

export const AppInput = ({ label, ...props }: AppInputProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={theme.colors.muted}
        selectionColor={theme.colors.primary}
        style={styles.input}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  wrap: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    ...theme.typography.label,
  },
  input: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.utility,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: theme.spacing.md,
  },
}));
