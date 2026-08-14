import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";
import { AppInput, Screen } from "@/shared/components";

import { normalizeKoreanPhone } from "./api";
import { AuthActionButton, PhoneHero } from "./components";
import { useLoginWithKakao, useRequestPhoneCode } from "./hooks";
import { loginWithKakaoNative } from "./kakao-native";

export const PhoneScreen = () => {
  const { kakaoToken } = useLocalSearchParams<{ kakaoToken?: string }>();
  const [phone, setPhone] = useState("");
  const { setSession } = useSession();
  const kakaoLogin = useLoginWithKakao();
  const requestCode = useRequestPhoneCode();

  const submit = async () => {
    try {
      const phoneE164 = normalizeKoreanPhone(phone);
      await requestCode.mutateAsync(phoneE164);
      router.push({ pathname: "/code", params: { phone: phoneE164, kakaoToken } });
    } catch {
      Alert.alert("전화번호를 확인해주세요", "한국 휴대폰 번호만 사용할 수 있어요.");
    }
  };

  const submitKakao = async () => {
    try {
      const accessToken = await loginWithKakaoNative();
      const result = await kakaoLogin.mutateAsync(accessToken);

      if (!result.requiresPhone) {
        setSession(result.session);
        router.replace("/matches");
        return;
      }

      router.push({
        pathname: "/phone",
        params: { kakaoToken: result.kakaoPhoneVerificationToken },
      });
    } catch {
      Alert.alert("카카오 로그인을 완료하지 못했어요");
    }
  };

  return (
    <Screen scroll>
      <PhoneHero />
      <AppInput
        keyboardType="phone-pad"
        label="전화번호"
        onChangeText={setPhone}
        placeholder="01012345678"
        value={phone}
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
