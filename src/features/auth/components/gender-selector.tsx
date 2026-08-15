import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { Gender } from "../types";

type GenderSelectorProps = {
  onChange: (value: Gender) => void;
  value?: Gender;
};

const genderOptions: { label: string; value: Gender }[] = [
  { label: "남자", value: "male" },
  { label: "여자", value: "female" },
];

export const GenderSelector = ({ onChange, value }: GenderSelectorProps) => {
  return (
    <View style={styles.genderRow}>
      {genderOptions.map((item) => (
        <Pressable
          key={item.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === item.value }}
          onPress={() => onChange(item.value)}
          style={[styles.genderButton, value === item.value && styles.genderButtonActive]}
        >
          <Text style={[styles.genderText, value === item.value && styles.genderTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  genderButton: {
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderText: {
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  genderTextActive: {
    color: theme.colors.primaryText,
  },
}));
