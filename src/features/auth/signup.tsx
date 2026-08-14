import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";
import { AppInput, Screen } from "@/shared/components";
import { colors } from "@/theme/tokens";

import { AuthActionButton, GenderSelector, SignupHeader } from "./components";
import { useCompleteKakaoPhoneSignup, useCompletePhoneSignup } from "./hooks";
import { Gender } from "./types";

export const SignupScreen = () => {
  const { kakaoToken, signupToken } = useLocalSearchParams<{
    kakaoToken?: string;
    signupToken: string;
  }>();
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoPhoneSignup();
  const complete = useCompletePhoneSignup();

  const submit = async () => {
    if (!signupToken) {
      Alert.alert("가입 토큰이 없습니다");
      return;
    }
    if (!gender) {
      Alert.alert("성별을 선택해주세요");
      return;
    }

    const result = kakaoToken
      ? await completeKakao.mutateAsync({
          kakaoPhoneVerificationToken: kakaoToken,
          signupToken,
          userName,
          gender,
        })
      : await complete.mutateAsync({ signupToken, userName, gender, email, password });
    setSession(result.session);
    router.replace("/matches");
  };

  return (
    <Screen scroll>
      <SignupHeader />
      <AppInput label="사용자 이름" maxLength={20} onChangeText={setUserName} value={userName} />
      <GenderSelector onChange={setGender} value={gender} />
      <AppInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="이메일"
        onChangeText={setEmail}
        value={email}
      />
      {!kakaoToken ? (
        <AppInput label="비밀번호" onChangeText={setPassword} secureTextEntry value={password} />
      ) : null}
      <Text style={styles.terms}>가입하면 필수 약관에 동의합니다.</Text>
      <AuthActionButton
        disabled={
          !userName.trim() ||
          !gender ||
          (!kakaoToken && (!email.trim() || !password.trim())) ||
          complete.isPending ||
          completeKakao.isPending
        }
        onPress={submit}
        title="프로필 만들고 추천 보기"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  terms: {
    color: colors.muted,
  },
});
