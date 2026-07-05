import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";
import { AppInput } from "@/shared/components/app-input";
import { Screen } from "@/shared/components/screen";
import { colors } from "@/theme/tokens";

import { AuthActionButton } from "./auth-action-button";
import { useCompleteKakaoPhoneSignup, useCompletePhoneSignup } from "./hooks";
import { Gender } from "./types";

const genderOptions: { label: string; value: Gender }[] = [
  { label: "남자", value: "male" },
  { label: "여자", value: "female" },
];

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
      ? await completeKakao.mutateAsync({ kakaoPhoneVerificationToken: kakaoToken, signupToken, userName, gender })
      : await complete.mutateAsync({ signupToken, userName, gender, email, password });
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
      <AppInput label="사용자 이름" maxLength={20} onChangeText={setUserName} value={userName} />
      <View style={styles.genderRow}>
        {genderOptions.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            onPress={() => setGender(item.value)}
            style={[styles.genderButton, gender === item.value && styles.genderButtonActive]}
          >
            <Text style={[styles.genderText, gender === item.value && styles.genderTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <AppInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="이메일"
        onChangeText={setEmail}
        value={email}
      />
      {!kakaoToken ? (
        <AppInput
          label="비밀번호"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
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
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  genderText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderTextActive: {
    color: colors.primaryText,
  },
  terms: {
    color: colors.muted,
  },
});
