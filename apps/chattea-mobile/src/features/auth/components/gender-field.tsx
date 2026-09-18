import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { Gender } from "../types";

const OPTIONS: { label: string; value: Gender }[] = [
  { label: "남성", value: "male" },
  { label: "여성", value: "female" },
];

const GenderField = ({
  onChange,
  value,
}: {
  onChange: (value: Gender) => void;
  value?: Gender;
}) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>성별</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipText, active && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  chip: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    flex: 1,
    justifyContent: "center",
    minHeight: theme.sizes.tapMin,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipSelected: {
    backgroundColor: theme.colors.text,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: theme.colors.background,
  },
}));

export default GenderField;
