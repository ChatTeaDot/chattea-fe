import type { TextInputProps } from "react-native";

export type AuthActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "kakao";
};

export type AuthFieldProps = TextInputProps & {
  label: string;
};

export type PhotoPickerProps = {
  onPress: () => void;
  uri?: string;
};

export type TermsAcceptanceProps = {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
};

export type AuthContinuation = {
  readonly kakaoToken?: string;
};

export type StoredAuthContinuation = AuthContinuation & {
  readonly expiresAt: number;
};
