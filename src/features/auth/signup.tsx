import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";
import { AppInput, ContentState, Screen } from "@/shared/components";

import { AuthActionButton, GenderSelector, SignupHeader, TermsAcceptance } from "./components";
import { clearAuthContinuation, loadAuthContinuation, useAuthContinuation } from "./continuation";
import { useCompleteKakaoPhoneSignup, useCompletePhoneSignup } from "./hooks";
import { Gender } from "./types";

export const SignupScreen = () => {
  const continuation = useAuthContinuation();
  const kakaoToken = continuation?.kakaoToken;
  const signupToken = continuation?.signupToken;
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoPhoneSignup();
  const complete = useCompletePhoneSignup();

  const submit = async () => {
    if (!gender) {
      Alert.alert("성별을 선택해주세요");
      return;
    }

    try {
      const current = await loadAuthContinuation();
      if (!current?.signupToken) {
        router.replace("/phone");
        return;
      }

      const result = current.kakaoToken
        ? await completeKakao.mutateAsync({
            kakaoPhoneVerificationToken: current.kakaoToken,
            signupToken: current.signupToken,
            userName,
            gender,
            termsAccepted,
          })
        : await complete.mutateAsync({
            signupToken: current.signupToken,
            userName,
            gender,
            email,
            password,
            termsAccepted,
          });
      await clearAuthContinuation();
      await setSession(result.session);
      router.replace("/matches");
    } catch {
      Alert.alert("가입을 완료하지 못했어요", "입력한 내용을 확인한 뒤 다시 시도해주세요.");
    }
  };

  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="가입 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  if (!signupToken) {
    return <Redirect href="/phone" />;
  }

  return (
    <Screen includeTopInset={false} scroll>
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
      <TermsAcceptance accepted={termsAccepted} onChange={setTermsAccepted} />
      <AuthActionButton
        disabled={
          !userName.trim() ||
          !gender ||
          !termsAccepted ||
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
