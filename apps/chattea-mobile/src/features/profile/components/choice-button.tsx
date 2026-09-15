import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { ChoiceButtonProps } from "../types";

const ChoiceButton = ({ label, selected, onPress }: ChoiceButtonProps) => {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
};
const styles = StyleSheet.create((theme) => ({
  choice: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceSelected: { backgroundColor: theme.colors.primary },
  choiceText: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  choiceTextSelected: { color: theme.colors.primaryText },
}));
export default ChoiceButton;
