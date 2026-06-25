import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { useSession } from "../../providers/session-provider";
import { AppInput } from "../../shared/components/app-input";
import { Screen } from "../../shared/components/screen";
import { colors } from "../../theme/tokens";
import { AuthActionButton } from "./auth-action-button";
import { useCompleteKakaoPhoneSignup, useCompletePhoneSignup } from "./hooks";

export function SignupScreen() {
  const { kakaoToken, signupToken } = useLocalSearchParams<{
    kakaoToken?: string;
    signupToken: string;
  }>();
  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoPhoneSignup();
  const complete = useCompletePhoneSignup();

  async function submit() {
    if (!signupToken) {
      Alert.alert("가입 토큰이 없습니다");
      return;
    }

    const result = kakaoToken
      ? await completeKakao.mutateAsync({ kakaoToken, signupToken, nickname, intro })
      : await complete.mutateAsync({ signupToken, nickname, intro });
    setSession(result.session);
    router.replace("/matches");
  }

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>프로필 만들기</Text>
      <AppInput label="닉네임" maxLength={20} onChangeText={setNickname} value={nickname} />
      <AppInput
        label={`소개 ${intro.length}/60`}
        maxLength={60}
        onChangeText={setIntro}
        value={intro}
      />
      <Text style={{ color: colors.muted }}>가입하면 필수 약관에 동의합니다.</Text>
      <AuthActionButton
        disabled={!nickname.trim() || complete.isPending || completeKakao.isPending}
        onPress={submit}
        title="시작하기"
      />
    </Screen>
  );
}
