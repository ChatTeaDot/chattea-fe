import { AuthActionButton, PhoneHero, usePhoneLogin } from "@/features/auth";
import { AppInput, ContentState, Screen } from "@/shared/components";

const PhoneScreen = () => {
  const { continuation, phoneValue, setPhone, requestCode, kakaoLogin, submit, submitKakao } =
    usePhoneLogin();
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

export default PhoneScreen;
