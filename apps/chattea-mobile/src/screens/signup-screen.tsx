import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

import {
  AuthActionButton,
  AuthField,
  BottomCta,
  GenderField,
  PhotoPicker,
  SIGNUP_MBTI_MAX_LENGTH,
  SIGNUP_NAME_MAX_LENGTH,
  TermsAcceptance,
  useSignup,
} from "@/features/auth";
import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme";

const SignupScreen = () => {
  const {
    continuation,
    kakaoToken,
    userName,
    setUserName,
    gender,
    setGender,
    heightCm,
    setHeightCm,
    job,
    setJob,
    mbti,
    setMbti,
    photoUri,
    pickPhoto,
    termsAccepted,
    setTermsAccepted,
    pending,
    submit,
  } = useSignup();
  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="가입 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  if (!kakaoToken) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.root}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.photoRow}>
          <PhotoPicker onPress={() => void pickPhoto()} uri={photoUri} />
        </View>
        <Text style={styles.hint}>프로필 사진</Text>
        <View style={styles.fields}>
          <AuthField
            label="닉네임"
            maxLength={SIGNUP_NAME_MAX_LENGTH}
            onChangeText={setUserName}
            placeholder="채티에서 쓸 이름"
            value={userName}
          />
          <GenderField onChange={setGender} value={gender} />
          <AuthField
            keyboardType="number-pad"
            label="키"
            onChangeText={setHeightCm}
            placeholder="키 (cm)"
            value={heightCm}
          />
          <AuthField label="직업" onChangeText={setJob} placeholder="직업" value={job} />
          <AuthField
            autoCapitalize="characters"
            label="MBTI"
            maxLength={SIGNUP_MBTI_MAX_LENGTH}
            onChangeText={setMbti}
            placeholder="MBTI"
            value={mbti}
          />
        </View>
        <View style={styles.terms}>
          <TermsAcceptance accepted={termsAccepted} onChange={setTermsAccepted} />
        </View>
      </KeyboardAwareScrollView>
      <BottomCta>
        <AuthActionButton
          disabled={!userName.trim() || !gender || !termsAccepted || pending}
          loading={pending}
          onPress={() => void submit()}
          title="가입 완료"
        />
      </BottomCta>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing.sm,
  },
  photoRow: {
    flexDirection: "row",
    gap: theme.spacing.control,
    paddingHorizontal: theme.spacing.md,
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  fields: {
    gap: theme.spacing.control,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  terms: {
    marginTop: theme.spacing.control,
    paddingHorizontal: theme.spacing.md,
  },
}));

export default SignupScreen;
