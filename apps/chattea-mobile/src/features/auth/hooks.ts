import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";

import {
  COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION,
  COMPLETE_KAKAO_PROFILE_SIGNUP_MUTATION,
  COMPLETE_PHONE_PROFILE_SIGNUP_MUTATION,
  COMPLETE_PHONE_SIGNUP_MUTATION,
  LOGIN_WITH_KAKAO_MUTATION,
  mapCompleteKakaoPhoneSignupResult,
  mapCompletePhoneSignupResult,
  mapLoginWithKakaoResult,
  mapRequestPhoneCodeResult,
  mapVerifyPhoneCodeResult,
  normalizeKoreanPhone,
  REQUEST_PHONE_CODE_MUTATION,
  VERIFY_PHONE_CODE_MUTATION,
} from "./api";
import {
  PHONE_CODE_RESEND_SECONDS,
  PHONE_CONTINUATION_TTL_MS,
  SIGNUP_CONTINUATION_TTL_MS,
} from "./constants";
import type { AuthContinuation, Gender, SignupProfileInput } from "./types";
import {
  clearAuthContinuation,
  getAuthContinuationExpiresAt,
  loadAuthContinuation,
  saveAuthContinuation,
} from "./utils/continuation";
import { loginWithKakaoNative } from "./utils/kakao-native";
import { getNextResendSeconds } from "./utils/resend-timer";

export const useRequestPhoneCode = () => {
  const [mutate, result] = useMutation(REQUEST_PHONE_CODE_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async (phoneE164: string) => {
      const { data } = await mutate({
        variables: { input: { phone: phoneE164, purpose: "Signup" } },
      });

      return mapRequestPhoneCodeResult(data);
    },
  };
};

export const useVerifyPhoneCode = () => {
  const [mutate, result] = useMutation(VERIFY_PHONE_CODE_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({ phone, code }: { readonly phone: string; readonly code: string }) => {
      const { data } = await mutate({ variables: { input: { phone, code } } });

      return mapVerifyPhoneCodeResult(data);
    },
  };
};

export const useCompletePhoneSignup = () => {
  const [mutate, result] = useMutation(COMPLETE_PHONE_SIGNUP_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      signupToken,
      userName,
      gender,
      email,
      password,
      termsAccepted,
    }: {
      readonly signupToken: string;
      readonly userName: string;
      readonly gender: Gender;
      readonly email: string;
      readonly password: string;
      readonly termsAccepted: boolean;
    }) => {
      const { data } = await mutate({
        variables: {
          input: {
            phoneVerificationToken: signupToken,
            userName,
            gender,
            email,
            password,
            termsAccepted,
          },
        },
      });

      return mapCompletePhoneSignupResult(data);
    },
  };
};

export const useLoginWithKakao = () => {
  const [mutate, result] = useMutation(LOGIN_WITH_KAKAO_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async (accessToken: string) => {
      const { data } = await mutate({ variables: { accessToken } });

      return mapLoginWithKakaoResult(data);
    },
  };
};

export const useCompleteKakaoPhoneSignup = () => {
  const [mutate, result] = useMutation(COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      kakaoPhoneVerificationToken,
      signupToken,
      userName,
      gender,
      termsAccepted,
    }: {
      readonly kakaoPhoneVerificationToken: string;
      readonly signupToken: string;
      readonly userName: string;
      readonly gender: Gender;
      readonly termsAccepted: boolean;
    }) => {
      const { data } = await mutate({
        variables: {
          input: {
            kakaoPhoneVerificationToken,
            phoneVerificationToken: signupToken,
            userName,
            gender,
            termsAccepted,
          },
        },
      });

      return mapCompleteKakaoPhoneSignupResult(data);
    },
  };
};

export const useCompletePhoneProfileSignup = () => {
  const [mutate, result] = useMutation(COMPLETE_PHONE_PROFILE_SIGNUP_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      signupToken,
      ...profile
    }: SignupProfileInput & { readonly signupToken: string }) => {
      const { data } = await mutate({
        variables: { input: { ...profile, phoneVerificationToken: signupToken } },
      });

      return mapCompletePhoneSignupResult(data);
    },
  };
};

export const useCompleteKakaoProfileSignup = () => {
  const [mutate, result] = useMutation(COMPLETE_KAKAO_PROFILE_SIGNUP_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      kakaoPhoneVerificationToken,
      signupToken,
      ...profile
    }: SignupProfileInput & {
      readonly kakaoPhoneVerificationToken: string;
      readonly signupToken: string;
    }) => {
      const { data } = await mutate({
        variables: {
          input: {
            ...profile,
            kakaoPhoneVerificationToken,
            phoneVerificationToken: signupToken,
          },
        },
      });

      return mapCompleteKakaoPhoneSignupResult(data);
    },
  };
};

export const useAuthContinuation = () => {
  const [continuation, setContinuation] = useState<AuthContinuation | null>();

  useEffect(() => {
    let active = true;
    void loadAuthContinuation()
      .then((value) => {
        if (active) setContinuation(value);
      })
      .catch(() => {
        if (active) setContinuation(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return continuation;
};

export const useKakaoLogin = () => {
  const { setSession } = useSession();
  const kakaoLogin = useLoginWithKakao();

  const submit = async () => {
    try {
      await clearAuthContinuation();
      const accessToken = await loginWithKakaoNative();
      const result = await kakaoLogin.mutateAsync(accessToken);

      if (!result.requiresPhone) {
        await setSession(result.session);
        router.replace("/matches");
        return;
      }

      await saveAuthContinuation(
        { kakaoToken: result.kakaoPhoneVerificationToken },
        getAuthContinuationExpiresAt(SIGNUP_CONTINUATION_TTL_MS, [
          result.kakaoPhoneVerificationToken,
        ]),
      );
      router.push("/phone");
    } catch {
      Alert.alert("카카오 로그인을 완료하지 못했어요");
    }
  };

  return { pending: kakaoLogin.isPending, submit };
};

export const usePhoneLogin = () => {
  const continuation = useAuthContinuation();
  const [phone, setPhone] = useState<string>();
  const requestCode = useRequestPhoneCode();
  const phoneValue = phone ?? continuation?.phone ?? "";
  const kakaoToken = continuation?.kakaoToken;

  const submit = async () => {
    try {
      const phoneE164 = normalizeKoreanPhone(phoneValue);
      await requestCode.mutateAsync(phoneE164);
      await saveAuthContinuation(
        { kakaoToken, phone: phoneE164 },
        getAuthContinuationExpiresAt(PHONE_CONTINUATION_TTL_MS, kakaoToken ? [kakaoToken] : []),
      );
      router.push("/code");
    } catch {
      Alert.alert(
        "인증번호를 받을 수 없어요",
        "전화번호를 확인하거나 카카오 로그인을 다시 시도해주세요.",
      );
    }
  };

  return { continuation, phoneValue, setPhone, requestCode, submit };
};

export const usePhoneVerification = () => {
  const continuation = useAuthContinuation();
  const phone = continuation?.phone;
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(PHONE_CODE_RESEND_SECONDS);
  const { setSession } = useSession();
  const requestCode = useRequestPhoneCode();
  const verify = useVerifyPhoneCode();

  useEffect(() => {
    if (resendSeconds === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds(getNextResendSeconds);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const resend = async () => {
    try {
      const current = await loadAuthContinuation();
      if (!current?.phone) {
        router.replace("/phone");
        return;
      }
      await requestCode.mutateAsync(current.phone);
      await saveAuthContinuation(
        { kakaoToken: current.kakaoToken, phone: current.phone },
        getAuthContinuationExpiresAt(
          PHONE_CONTINUATION_TTL_MS,
          current.kakaoToken ? [current.kakaoToken] : [],
        ),
      );
      setResendSeconds(PHONE_CODE_RESEND_SECONDS);
    } catch {
      Alert.alert("인증번호를 다시 보낼 수 없어요");
    }
  };

  const submit = async () => {
    try {
      const current = await loadAuthContinuation();
      if (!current?.phone) {
        router.replace("/phone");
        return;
      }

      const result = await verify.mutateAsync({ phone: current.phone, code });
      if (result.status === "LOGIN") {
        await clearAuthContinuation();
        await setSession(result.session);
        router.replace("/matches");
        return;
      }

      await saveAuthContinuation(
        {
          kakaoToken: current.kakaoToken,
          phone: current.phone,
          signupToken: result.signupToken,
        },
        getAuthContinuationExpiresAt(
          SIGNUP_CONTINUATION_TTL_MS,
          current.kakaoToken ? [current.kakaoToken, result.signupToken] : [result.signupToken],
        ),
      );
      router.push("/signup");
    } catch {
      Alert.alert("인증을 완료하지 못했어요", "인증번호를 확인한 뒤 다시 시도해주세요.");
    }
  };

  return { continuation, phone, code, setCode, resend, submit, requestCode, resendSeconds, verify };
};

export const useSignup = () => {
  const continuation = useAuthContinuation();
  const signupToken = continuation?.signupToken;
  const [userName, setUserName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [job, setJob] = useState("");
  const [mbti, setMbti] = useState("");
  const [photoUri, setPhotoUri] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoProfileSignup();
  const complete = useCompletePhoneProfileSignup();

  const pickPhoto = async () => {
    const ImagePicker = await import("expo-image-picker");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      selectionLimit: 1,
    });
    const uri = result.canceled ? undefined : result.assets[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  const submit = async () => {
    try {
      const current = await loadAuthContinuation();
      if (!current?.signupToken) {
        router.replace("/phone");
        return;
      }

      const parsedHeight = Number(heightCm);
      const profile: SignupProfileInput = {
        heightCm: heightCm.trim() && Number.isFinite(parsedHeight) ? parsedHeight : undefined,
        job: job.trim() || undefined,
        mbti: mbti.trim() || undefined,
        termsAccepted,
        userName: userName.trim(),
      };
      const result = current.kakaoToken
        ? await completeKakao.mutateAsync({
            kakaoPhoneVerificationToken: current.kakaoToken,
            signupToken: current.signupToken,
            ...profile,
          })
        : await complete.mutateAsync({ signupToken: current.signupToken, ...profile });
      await clearAuthContinuation();
      await setSession(result.session);
      router.replace("/matches");
    } catch {
      Alert.alert("가입을 완료하지 못했어요", "입력한 내용을 확인한 뒤 다시 시도해주세요.");
    }
  };

  return {
    continuation,
    signupToken,
    userName,
    setUserName,
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
    pending: complete.isPending || completeKakao.isPending,
    submit,
  };
};
