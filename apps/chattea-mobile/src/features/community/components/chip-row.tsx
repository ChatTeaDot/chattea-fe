import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { ChipRowProps } from "../types";

const ChipRow = <ItemT extends string>({ items, onSelect, selected }: ChipRowProps<ItemT>) => {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const active = item === selected;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={item}
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, active && styles.chipTextSelected]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.control,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.control,
    paddingVertical: theme.spacing.sm,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipSelected: {
    backgroundColor: theme.colors.text,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  chipTextSelected: {
    color: theme.colors.background,
  },
}));

export default ChipRow;
