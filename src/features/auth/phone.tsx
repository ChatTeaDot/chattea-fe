import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";
import { AppInput, ContentState, Screen } from "@/shared/components";

import { normalizeKoreanPhone } from "./api";
import { AuthActionButton, PhoneHero } from "./components";
import {
  clearAuthContinuation,
  getAuthContinuationExpiresAt,
  PHONE_CONTINUATION_TTL_MS,
  saveAuthContinuation,
  SIGNUP_CONTINUATION_TTL_MS,
  useAuthContinuation,
} from "./continuation";
import { useLoginWithKakao, useRequestPhoneCode } from "./hooks";
import { loginWithKakaoNative } from "./kakao-native";

export const PhoneScreen = () => {
  const continuation = useAuthContinuation();
  const [phone, setPhone] = useState<string>();
  const [kakaoTokenOverride, setKakaoTokenOverride] = useState<string | null>();
  const { setSession } = useSession();
  const kakaoLogin = useLoginWithKakao();
  const requestCode = useRequestPhoneCode();
  const phoneValue = phone ?? continuation?.phone ?? "";
  const kakaoToken =
    kakaoTokenOverride === undefined ? continuation?.kakaoToken : (kakaoTokenOverride ?? undefined);

  const submit = async () => {
    try {
      const phoneE164 = normalizeKoreanPhone(phoneValue);
      await requestCode.mutateAsync(phoneE164);
      await saveAuthContinuation(
        { kakaoToken, phone: phoneE164 },
        getAuthContinuationExpiresAt(PHONE_CONTINUATION_TTL_MS, kakaoToken ? [kakaoToken] : []),
      );
      router.push("/code");
    } catch {
      Alert.alert(
        "인증번호를 받을 수 없어요",
        "전화번호를 확인하거나 카카오 로그인을 다시 시도해주세요.",
      );
    }
  };

  const submitKakao = async () => {
    setPhone("");
    setKakaoTokenOverride(null);
    try {
      await clearAuthContinuation();
      const accessToken = await loginWithKakaoNative();
      const result = await kakaoLogin.mutateAsync(accessToken);

      if (!result.requiresPhone) {
        await setSession(result.session);
        router.replace("/matches");
        return;
      }

      await saveAuthContinuation(
        { kakaoToken: result.kakaoPhoneVerificationToken },
        getAuthContinuationExpiresAt(SIGNUP_CONTINUATION_TTL_MS, [
          result.kakaoPhoneVerificationToken,
        ]),
      );
      setKakaoTokenOverride(result.kakaoPhoneVerificationToken);
    } catch {
      setKakaoTokenOverride(null);
      Alert.alert("카카오 로그인을 완료하지 못했어요");
    }
  };

  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="인증 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  return (
    <Screen includeTopInset={false} scroll>
      <PhoneHero />
      <AppInput
        keyboardType="phone-pad"
        label="전화번호"
        onChangeText={setPhone}
        placeholder="01012345678"
        value={phoneValue}
      />
      <AuthActionButton
        disabled={requestCode.isPending}
        onPress={submit}
        title="인증번호 받고 계속하기"
      />
      <AuthActionButton
        disabled={kakaoLogin.isPending}
        onPress={submitKakao}
        title="카카오로 계속"
        variant="outlined"
      />
    </Screen>
  );
};
