import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { useSession } from "../../providers/session-provider";
import { AppInput } from "../../shared/components/app-input";
import { Screen } from "../../shared/components/screen";
import { colors } from "../../theme/tokens";
import { normalizeKoreanPhone } from "./api";
import { AuthActionButton } from "./auth-action-button";
import { useLoginWithKakao, useRequestPhoneCode } from "./hooks";
import { loginWithKakaoNative } from "./kakao-native";

export function PhoneScreen() {
  const { kakaoToken } = useLocalSearchParams<{ kakaoToken?: string }>();
  const [phone, setPhone] = useState("");
  const { setSession } = useSession();
  const kakaoLogin = useLoginWithKakao();
  const requestCode = useRequestPhoneCode();

  async function submit() {
    try {
      const phoneE164 = normalizeKoreanPhone(phone);
      await requestCode.mutateAsync(phoneE164);
      router.push({ pathname: "/code", params: { phone: phoneE164, kakaoToken } });
    } catch {
      Alert.alert("전화번호를 확인해주세요", "한국 휴대폰 번호만 사용할 수 있어요.");
    }
  }

  async function submitKakao() {
    try {
      const accessToken = await loginWithKakaoNative();
      const result = await kakaoLogin.mutateAsync(accessToken);

      if (!result.requiresPhone) {
        setSession(result.session);
        router.replace("/matches");
        return;
      }

      router.push({ pathname: "/phone", params: { kakaoToken: result.kakaoToken } });
    } catch {
      Alert.alert("카카오 로그인을 완료하지 못했어요");
    }
  }

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800" }}>ChatTea</Text>
      <AppInput
        keyboardType="phone-pad"
        label="전화번호"
        onChangeText={setPhone}
        placeholder="01012345678"
        value={phone}
      />
      <AuthActionButton disabled={requestCode.isPending} onPress={submit} title="인증번호 받기" />
      <AuthActionButton
        disabled={kakaoLogin.isPending}
        onPress={submitKakao}
        title="카카오로 계속"
        variant="outlined"
      />
    </Screen>
  );
}
