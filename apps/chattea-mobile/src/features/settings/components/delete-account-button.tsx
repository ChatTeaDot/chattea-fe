import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/i18n";

import type { DeleteAccountButtonProps } from "../types";

const DeleteAccountButton = ({ disabled, onPress }: DeleteAccountButtonProps) => {
  const { t } = useTranslation("settings");
  return (
    <Pressable
      accessibilityLabel={t("delete.action")}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.buttonPressed]}
    >
      <Text style={styles.buttonText}>{t("delete.action")}</Text>
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
