import { Button, Host, UniversalStyle } from "@expo/ui";
import { View, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme/tokens";

type AuthActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "text";
};

export function AuthActionButton({
  title,
  onPress,
  disabled = false,
  variant = "filled",
}: AuthActionButtonProps) {
  const buttonStyle = disabled ? styles.disabledButton : styles.button;

  return (
    <View style={styles.wrap}>
      <Host matchContents={{ vertical: true }}>
        <Button
          disabled={disabled}
          label={title}
          onPress={onPress}
          style={buttonStyle}
          variant={variant}
        />
      </Host>
    </View>
  );
}

const button: UniversalStyle = {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  borderRadius: 8,
  borderWidth: 1,
  height: 48,
  paddingHorizontal: spacing.md,
  width: "100%",
};

const styles: {
  wrap: ViewStyle;
  button: UniversalStyle;
  disabledButton: UniversalStyle;
} = {
  wrap: {
    minHeight: 48,
    width: "100%",
  },
  button,
  disabledButton: {
    ...button,
    opacity: 0.5,
  },
};
