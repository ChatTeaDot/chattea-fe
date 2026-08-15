import { AppButton } from "@/shared/components";

type AuthActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "text";
};

export const AuthActionButton = ({
  title,
  onPress,
  disabled = false,
  variant = "filled",
}: AuthActionButtonProps) => (
  <AppButton disabled={disabled} onPress={onPress} title={title} variant={variant} />
);
