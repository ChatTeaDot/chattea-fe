import { Text, TextInput, TextInputProps, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

type AppInputProps = TextInputProps & {
  label: string;
};

export const AppInput = ({ label, ...props }: AppInputProps) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
});
