import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";
import { Screen } from "@/shared/components";

import { CodeVerificationForm } from "./code-verification-form";
import { useRequestPhoneCode, useVerifyPhoneCode } from "./hooks";
import { getNextResendSeconds, PHONE_CODE_RESEND_SECONDS } from "./resend-timer";

export const CodeScreen = () => {
  const { kakaoToken, phone } = useLocalSearchParams<{ kakaoToken?: string; phone: string }>();
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(PHONE_CODE_RESEND_SECONDS);
  const { setSession } = useSession();
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

  const resend = async () => {
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
  };

  const submit = async () => {
    if (!phone) {
      Alert.alert("전화번호가 없습니다");
      return;
    }

    const result = await verify.mutateAsync({ phone, code });
    if (result.status === "LOGIN") {
      setSession(result.session);
      router.replace("/matches");
      return;
    }

    router.push({ pathname: "/signup", params: { kakaoToken, signupToken: result.signupToken } });
  };

  return (
    <Screen>
      <CodeVerificationForm
        attachPending={false}
        code={code}
        onChangeCode={setCode}
        onResend={resend}
        onSubmit={submit}
        requestPending={requestCode.isPending}
        resendSeconds={resendSeconds}
        verifyPending={verify.isPending}
      />
    </Screen>
  );
};
