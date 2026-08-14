import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppInput } from "@/shared/components";
import { colors } from "@/theme/tokens";

import { getResendTitle } from "../resend-timer";
import { AuthActionButton } from "./auth-action-button";

type CodeVerificationFormProps = {
  attachPending: boolean;
  code: string;
  requestPending: boolean;
  resendSeconds: number;
  verifyPending: boolean;
  onChangeCode: (value: string) => void;
  onResend: () => void;
  onSubmit: () => void;
};

export const CodeVerificationForm = ({
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
        maxLength={6}
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

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  help: {
    color: colors.muted,
  },
});
