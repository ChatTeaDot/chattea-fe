import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";
import { AppInput } from "@/shared/components/app-input";
import { Screen } from "@/shared/components/screen";
import { colors } from "@/theme/tokens";

import { AuthActionButton } from "./auth-action-button";
import { useCompleteKakaoPhoneSignup, useCompletePhoneSignup } from "./hooks";

export const SignupScreen = () => {
  const { kakaoToken, signupToken } = useLocalSearchParams<{
    kakaoToken?: string;
    signupToken: string;
  }>();
  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoPhoneSignup();
  const complete = useCompletePhoneSignup();

  const submit = async () => {
    if (!signupToken) {
      Alert.alert("가입 토큰이 없습니다");
      return;
    }

    const result = kakaoToken
      ? await completeKakao.mutateAsync({ kakaoToken, signupToken, nickname, intro })
      : await complete.mutateAsync({ signupToken, nickname, intro });
    setSession(result.session);
    router.replace("/matches");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>프로필</Text>
        <Text style={styles.title}>첫인상을 만들어주세요</Text>
        <Text style={styles.copy}>짧아도 좋아요. 대화가 시작될 이유 하나면 충분합니다.</Text>
      </View>
      <AppInput label="닉네임" maxLength={20} onChangeText={setNickname} value={nickname} />
      <AppInput
        label={`소개 ${intro.length}/60`}
        maxLength={60}
        onChangeText={setIntro}
        value={intro}
      />
      <Text style={styles.terms}>가입하면 필수 약관에 동의합니다.</Text>
      <AuthActionButton
        disabled={!nickname.trim() || complete.isPending || completeKakao.isPending}
        onPress={submit}
        title="시작하기"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  terms: {
    color: colors.muted,
  },
});
