import { Text, TextInput, TextInputProps, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, radii, spacing, typography } from "@/theme/tokens";

type AppInputProps = TextInputProps & {
  label: string;
};

export const AppInput = ({ label, ...props }: AppInputProps) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={styles.input}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    ...typography.label,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.utility,
    color: colors.text,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
});
