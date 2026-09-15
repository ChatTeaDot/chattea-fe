import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import type { TermsAcceptanceProps } from "../types";

const TermsAcceptance = ({ accepted, onChange }: TermsAcceptanceProps) => {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: accepted }}
      onPress={() => onChange(!accepted)}
      style={styles.control}
    >
      <Text style={[styles.indicator, accepted && styles.indicatorChecked]}>
        {accepted ? "✓" : ""}
      </Text>
      <Text style={styles.label}>필수 약관에 동의합니다.</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  control: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 44,
  },
  indicator: {
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    color: theme.colors.primaryText,
    height: 24,
    lineHeight: 22,
    textAlign: "center",
    width: 24,
  },
  indicatorChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.muted,
  },
}));

export default TermsAcceptance;
