import { AppButton } from "@/shared/components";

import type { AuthActionButtonProps } from "../types";

const AuthActionButton = ({
  title,
  onPress,
  disabled = false,
  variant = "filled",
}: AuthActionButtonProps) => {
  return <AppButton disabled={disabled} onPress={onPress} title={title} variant={variant} />;
};

export default AuthActionButton;
