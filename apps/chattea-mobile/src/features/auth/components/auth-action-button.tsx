import { ActivityIndicator, Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import type { AuthActionButtonProps } from "../types";

const AuthActionButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: AuthActionButtonProps) => {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "kakao" && styles.kakao,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={styles.loadingIndicator.color} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.secondaryText,
            variant === "kakao" && styles.kakaoText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.cta,
    height: theme.sizes.buttonLg,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    width: "100%",
  },
  secondary: {
    backgroundColor: theme.colors.surface,
  },
  kakao: {
    backgroundColor: theme.colors.kakao,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: theme.colors.accentText,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    color: theme.colors.text,
  },
  kakaoText: {
    color: theme.colors.kakaoText,
  },
  loadingIndicator: {
    color: theme.colors.accentText,
  },
}));

export default AuthActionButton;
