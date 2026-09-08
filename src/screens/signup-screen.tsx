import { Redirect } from "expo-router";

import {
  AuthActionButton,
  GenderSelector,
  SIGNUP_NAME_MAX_LENGTH,
  SignupHeader,
  TermsAcceptance,
  useSignup,
} from "@/features/auth";
import { AppInput, ContentState, Screen } from "@/shared/components";

const SignupScreen = () => {
  const {
    continuation,
    signupToken,
    userName,
    setUserName,
    gender,
    setGender,
    email,
    setEmail,
    password,
    setPassword,
    termsAccepted,
    setTermsAccepted,
    kakaoToken,
    complete,
    completeKakao,
    submit,
  } = useSignup();
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
      <AppInput
        label="사용자 이름"
        maxLength={SIGNUP_NAME_MAX_LENGTH}
        onChangeText={setUserName}
        value={userName}
      />
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

export default SignupScreen;
