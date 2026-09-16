import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { DeleteAccountButtonProps } from "../types";

const DeleteAccountButton = ({ disabled, onPress }: DeleteAccountButtonProps) => {
  return (
    <Pressable
      accessibilityLabel="탈퇴하기"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.buttonPressed]}
    >
      <Text style={styles.buttonText}>탈퇴하기</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radii.pill,
    justifyContent: "center",
    marginHorizontal: theme.spacing.screen,
    minHeight: 36,
    paddingHorizontal: theme.spacing.control,
  },
  buttonPressed: {
    opacity: 0.62,
  },
  buttonText: {
    color: theme.colors.primaryText,
    fontSize: 14,
    fontWeight: "600",
  },
}));

export default DeleteAccountButton;
