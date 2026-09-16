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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={[styles.box, accepted && styles.boxChecked]} />
      <Text style={styles.label}>이용약관·개인정보 동의 (필수)</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  row: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: theme.sizes.tapMin,
    paddingHorizontal: theme.spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
  box: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.sm,
    height: 20,
    width: 20,
  },
  boxChecked: {
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
  },
}));

export default TermsAcceptance;
