import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, type TextInputProps, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";

import { normalizeKoreanPhone } from "../auth/api";
import {
  useCompleteKakaoPhoneSignup,
  useCompletePhoneSignup,
  useLoginWithKakao,
  useRequestPhoneCode,
  useVerifyPhoneCode,
} from "../auth/hooks";
import { loginWithKakaoNative } from "../auth/kakao-native";
import { getNextResendSeconds, PHONE_CODE_RESEND_SECONDS } from "../auth/resend-timer";
import type { Gender } from "../auth/types";
import { NativeButton, NativeScreen, NativeScroll } from "./components";

export const NativePhoneScreen = () => {
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
      Alert.alert("전화번호를 확인해 주세요", "국가번호 없이 휴대폰 번호만 입력해 주세요.");
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
      Alert.alert("카카오 로그인을 완료하지 못했어요", "잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <View style={styles.hero}>
          <Text style={styles.kicker}>오늘의 인연</Text>
          <Text style={styles.title}>편안하게 대화할 사람을 만나 보세요</Text>
          <Text style={styles.copy}>
            전화번호를 확인한 뒤, 프로필에 맞는 인연을 추천해 드릴게요.
          </Text>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>전화번호</Text>
          <NativeTextInput
            autoComplete="tel"
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="01012345678"
            style={styles.input}
            value={phone}
          />
        </View>
        <NativeButton
          disabled={requestCode.isPending || !phone.trim()}
          label="인증번호 받기"
          onPress={() => void submit()}
          fullWidth
        />
        <NativeButton
          disabled={kakaoLogin.isPending}
          label="카카오로 계속"
          onPress={() => void submitKakao()}
          tone="secondary"
          fullWidth
        />
        <Text style={styles.footnote}>계속하면 서비스 이용에 필요한 약관에 동의하게 돼요.</Text>
      </NativeScroll>
    </NativeScreen>
  );
};

export const NativeCodeScreen = () => {
  const { kakaoToken, phone } = useLocalSearchParams<{ kakaoToken?: string; phone: string }>();
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(PHONE_CODE_RESEND_SECONDS);
  const { setSession } = useSession();
  const requestCode = useRequestPhoneCode();
  const verify = useVerifyPhoneCode();

  useEffect(() => {
    if (resendSeconds === 0) return;
    const timer = setTimeout(() => setResendSeconds(getNextResendSeconds), 1_000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const submit = async () => {
    if (!phone) return;
    try {
      const result = await verify.mutateAsync({ phone, code });
      if (result.status === "LOGIN") {
        setSession(result.session);
        router.replace("/matches");
        return;
      }
      router.push({ pathname: "/signup", params: { kakaoToken, signupToken: result.signupToken } });
    } catch {
      Alert.alert("인증번호를 확인해 주세요", "문자로 받은 6자리 번호를 다시 입력해 주세요.");
    }
  };

  const resend = async () => {
    if (!phone) return;
    try {
      await requestCode.mutateAsync(phone);
      setResendSeconds(PHONE_CODE_RESEND_SECONDS);
    } catch {
      Alert.alert("인증번호를 다시 보내지 못했어요", "잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <View style={styles.heroCompact}>
          <Text style={styles.titleSmall}>인증번호를 입력해 주세요</Text>
          <Text style={styles.copy}>{phone}로 보낸 6자리 번호예요.</Text>
        </View>
        <NativeTextInput
          autoComplete="one-time-code"
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setCode}
          placeholder="6자리 인증번호"
          style={styles.input}
          value={code}
        />
        <NativeButton
          disabled={code.length !== 6 || verify.isPending}
          label="확인"
          onPress={() => void submit()}
          fullWidth
        />
        <NativeButton
          disabled={resendSeconds > 0 || requestCode.isPending}
          label={resendSeconds > 0 ? `${resendSeconds}초 후 다시 보내기` : "인증번호 다시 받기"}
          onPress={() => void resend()}
          tone="quiet"
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

export const NativeSignupScreen = () => {
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
  const pending = complete.isPending || completeKakao.isPending;

  const submit = async () => {
    if (!signupToken || !gender) {
      Alert.alert("가입 정보를 확인해 주세요", "이름과 성별을 입력해 주세요.");
      return;
    }
    try {
      const result = kakaoToken
        ? await completeKakao.mutateAsync({
            kakaoPhoneVerificationToken: kakaoToken,
            signupToken,
            userName,
            gender,
          })
        : await complete.mutateAsync({ signupToken, userName, gender, email, password });
      setSession(result.session);
      router.replace("/profile-completion");
    } catch {
      Alert.alert("가입을 완료하지 못했어요", "입력한 정보를 확인하고 다시 시도해 주세요.");
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <View style={styles.heroCompact}>
          <Text style={styles.titleSmall}>기본 정보를 알려주세요</Text>
          <Text style={styles.copy}>프로필은 다음 단계에서 더 자세히 설정할 수 있어요.</Text>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>이름</Text>
          <NativeTextInput
            maxLength={20}
            onChangeText={setUserName}
            placeholder="이름"
            style={styles.input}
            value={userName}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>성별</Text>
          <View style={styles.choiceRow}>
            <GenderChoice
              label="남성"
              selected={gender === "male"}
              onPress={() => setGender("male")}
            />
            <GenderChoice
              label="여성"
              selected={gender === "female"}
              onPress={() => setGender("female")}
            />
          </View>
        </View>
        {!kakaoToken ? (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이메일</Text>
              <NativeTextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="name@example.com"
                style={styles.input}
                value={email}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <NativeTextInput
                onChangeText={setPassword}
                placeholder="비밀번호"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
          </>
        ) : null}
        <NativeButton
          disabled={
            !userName.trim() ||
            !gender ||
            (!kakaoToken && (!email.trim() || !password.trim())) ||
            pending
          }
          label="다음으로"
          onPress={() => void submit()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

const GenderChoice = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.choice, selected && styles.choiceSelected]}
  >
    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
  </Pressable>
);

const NativeTextInput = ({ placeholderTextColor, ...props }: TextInputProps) => {
  const { theme } = useUnistyles();
  return <TextInput {...props} placeholderTextColor={placeholderTextColor ?? theme.colors.muted} />;
};

const styles = StyleSheet.create((theme) => ({
  hero: { gap: theme.spacing.md, paddingTop: 44 },
  heroCompact: { gap: theme.spacing.sm, paddingTop: theme.spacing.lg },
  kicker: { color: theme.colors.primary, fontSize: 15, fontWeight: "700" },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 43,
  },
  titleSmall: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  copy: { color: theme.colors.muted, fontSize: 16, lineHeight: 24 },
  footnote: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  fieldGroup: { gap: theme.spacing.sm },
  label: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  choiceRow: { flexDirection: "row", gap: theme.spacing.sm },
  choice: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  choiceText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  choiceSelected: { backgroundColor: theme.colors.primary },
  choiceTextSelected: { color: theme.colors.primaryText },
}));
