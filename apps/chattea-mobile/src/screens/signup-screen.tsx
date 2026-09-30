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
import { useTranslation } from "@/i18n";
import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme";

const SignupScreen = () => {
  const { t } = useTranslation("auth");
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
        <ContentState kind="loading" title={t("signup.checking")} />
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
        <Text style={styles.hint}>{t("signup.photoHint")}</Text>
        <View style={styles.fields}>
          <AuthField
            label={t("signup.nicknameLabel")}
            maxLength={SIGNUP_NAME_MAX_LENGTH}
            onChangeText={setUserName}
            placeholder={t("signup.nicknamePlaceholder")}
            value={userName}
          />
          <GenderField onChange={setGender} value={gender} />
          <AuthField
            keyboardType="number-pad"
            label={t("signup.heightLabel")}
            onChangeText={setHeightCm}
            placeholder={t("signup.heightPlaceholder")}
            value={heightCm}
          />
          <AuthField
            label={t("signup.jobLabel")}
            onChangeText={setJob}
            placeholder={t("signup.jobPlaceholder")}
            value={job}
          />
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
          title={t("signup.submit")}
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
