import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors } from "@/theme/tokens";

import { Gender } from "./types";

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
          accessibilityRole="button"
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

const styles = StyleSheet.create({
  genderButton: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  genderTextActive: {
    color: colors.primaryText,
  },
});
