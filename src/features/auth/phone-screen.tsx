import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";
import { AppInput } from "@/shared/components/app-input";
import { Screen } from "@/shared/components/screen";
import { colors } from "@/theme/tokens";

import { normalizeKoreanPhone } from "./api";
import { AuthActionButton } from "./auth-action-button";
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
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>소개팅은 가볍게, 대화는 진하게</Text>
        <Text style={styles.title}>오늘 마실 차 한 잔 같은 인연</Text>
        <Text style={styles.copy}>
          전화번호 인증 후 맞는 사람을 추천받고 바로 대화를 시작하세요.
        </Text>
      </View>
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
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    padding: 22,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
