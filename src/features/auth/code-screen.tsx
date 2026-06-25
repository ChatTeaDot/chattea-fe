import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import { AppInput } from "../../shared/components/app-input";
import { Screen } from "../../shared/components/screen";
import { colors } from "../../theme/tokens";
import { useSession } from "../../providers/session-provider";
import { AuthActionButton } from "./auth-action-button";
import { useAttachPhoneToMe, useRequestPhoneCode, useVerifyPhoneCode } from "./hooks";
import { getNextResendSeconds, getResendTitle, PHONE_CODE_RESEND_SECONDS } from "./resend-timer";

export function CodeScreen() {
  const { kakaoToken, phone } = useLocalSearchParams<{ kakaoToken?: string; phone: string }>();
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(PHONE_CODE_RESEND_SECONDS);
  const { setSession } = useSession();
  const attachPhone = useAttachPhoneToMe();
  const requestCode = useRequestPhoneCode();
  const verify = useVerifyPhoneCode();

  useEffect(() => {
    if (resendSeconds === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds(getNextResendSeconds);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  async function resend() {
    if (!phone) {
      Alert.alert("전화번호가 없습니다");
      return;
    }

    try {
      await requestCode.mutateAsync(phone);
      setResendSeconds(PHONE_CODE_RESEND_SECONDS);
    } catch {
      Alert.alert("인증번호를 다시 보낼 수 없어요");
    }
  }

  async function submit() {
    if (!phone) {
      Alert.alert("전화번호가 없습니다");
      return;
    }

    if (kakaoToken) {
      try {
        const attached = await attachPhone.mutateAsync({ kakaoToken, phone, code });
        setSession(attached.session);
        router.replace("/matches");
        return;
      } catch (error) {
        if (!String(error).includes("PHONE_SIGNUP_REQUIRED")) {
          Alert.alert("인증번호를 확인해주세요");
          return;
        }

        const result = await verify.mutateAsync({ phone, code });
        if (result.status === "SIGNUP_REQUIRED") {
          router.push({
            pathname: "/signup",
            params: { kakaoToken, signupToken: result.signupToken },
          });
          return;
        }
        setSession(result.session);
        router.replace("/matches");
        return;
      }
    }

    const result = await verify.mutateAsync({ phone, code });
    if (result.status === "LOGIN") {
      setSession(result.session);
      router.replace("/matches");
      return;
    }

    router.push({ pathname: "/signup", params: { signupToken: result.signupToken } });
  }

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>인증번호</Text>
      <AppInput
        keyboardType="number-pad"
        label="6자리 코드"
        maxLength={6}
        onChangeText={setCode}
        value={code}
      />
      <AuthActionButton
        disabled={code.length !== 6 || verify.isPending || attachPhone.isPending}
        onPress={submit}
        title="확인"
      />
      <AuthActionButton
        disabled={resendSeconds > 0 || requestCode.isPending}
        onPress={resend}
        title={getResendTitle(resendSeconds)}
        variant="text"
      />
      <Text style={{ color: colors.muted }}>인증번호는 5분 동안 유효합니다.</Text>
    </Screen>
  );
}
