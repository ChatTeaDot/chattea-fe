import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppInput } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

import { PHONE_CODE_LENGTH } from "../constants";
import type { CodeVerificationFormProps } from "../types";
import { getResendTitle } from "../utils/resend-timer";
import AuthActionButton from "./auth-action-button";

const CodeVerificationForm = ({
  attachPending,
  code,
  requestPending,
  resendSeconds,
  verifyPending,
  onChangeCode,
  onResend,
  onSubmit,
}: CodeVerificationFormProps) => {
  return (
    <>
      <Text style={styles.title}>문자로 받은 번호를 입력해 주세요</Text>
      <AppInput
        keyboardType="number-pad"
        label="6자리 코드"
        maxLength={PHONE_CODE_LENGTH}
        onChangeText={onChangeCode}
        value={code}
      />
      <AuthActionButton
        disabled={code.length !== 6 || verifyPending || attachPending}
        onPress={onSubmit}
        title="확인하고 계속하기"
      />
      <AuthActionButton
        disabled={resendSeconds > 0 || requestPending}
        onPress={onResend}
        title={getResendTitle(resendSeconds)}
        variant="text"
      />
      <Text style={styles.help}>인증번호는 5분 동안 유효합니다.</Text>
    </>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  help: {
    color: theme.colors.muted,
  },
}));

export default CodeVerificationForm;
