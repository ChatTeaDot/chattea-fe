import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";
import { ContentState, Screen } from "@/shared/components";

import { CodeVerificationForm } from "./components";
import {
  clearAuthContinuation,
  getAuthContinuationExpiresAt,
  loadAuthContinuation,
  PHONE_CONTINUATION_TTL_MS,
  saveAuthContinuation,
  SIGNUP_CONTINUATION_TTL_MS,
  useAuthContinuation,
} from "./continuation";
import { useRequestPhoneCode, useVerifyPhoneCode } from "./hooks";
import { getNextResendSeconds, PHONE_CODE_RESEND_SECONDS } from "./resend-timer";

export const CodeScreen = () => {
  const continuation = useAuthContinuation();
  const phone = continuation?.phone;
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
    try {
      const current = await loadAuthContinuation();
      if (!current?.phone) {
        router.replace("/phone");
        return;
      }
      await requestCode.mutateAsync(current.phone);
      await saveAuthContinuation(
        { kakaoToken: current.kakaoToken, phone: current.phone },
        getAuthContinuationExpiresAt(
          PHONE_CONTINUATION_TTL_MS,
          current.kakaoToken ? [current.kakaoToken] : [],
        ),
      );
      setResendSeconds(PHONE_CODE_RESEND_SECONDS);
    } catch {
      Alert.alert("인증번호를 다시 보낼 수 없어요");
    }
  };

  const submit = async () => {
    try {
      const current = await loadAuthContinuation();
      if (!current?.phone) {
        router.replace("/phone");
        return;
      }

      const result = await verify.mutateAsync({ phone: current.phone, code });
      if (result.status === "LOGIN") {
        await clearAuthContinuation();
        setSession(result.session);
        router.replace("/matches");
        return;
      }

      await saveAuthContinuation(
        {
          kakaoToken: current.kakaoToken,
          phone: current.phone,
          signupToken: result.signupToken,
        },
        getAuthContinuationExpiresAt(
          SIGNUP_CONTINUATION_TTL_MS,
          current.kakaoToken ? [current.kakaoToken, result.signupToken] : [result.signupToken],
        ),
      );
      router.push("/signup");
    } catch {
      Alert.alert("인증을 완료하지 못했어요", "인증번호를 확인한 뒤 다시 시도해주세요.");
    }
  };

  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="인증 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  if (!phone) {
    return <Redirect href="/phone" />;
  }

  return (
    <Screen avoidKeyboard includeTopInset={false}>
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
