import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSession } from "@/providers/session-provider";

import {
  COMPLETE_KAKAO_SIGNUP_MUTATION,
  LOGIN_WITH_KAKAO_MUTATION,
  mapCompleteKakaoSignupResult,
  mapLoginWithKakaoResult,
} from "./api";
import { SIGNUP_CONTINUATION_TTL_MS } from "./constants";
import type { AuthContinuation, Gender, SignupProfileInput } from "./types";
import {
  clearAuthContinuation,
  getAuthContinuationExpiresAt,
  loadAuthContinuation,
  saveAuthContinuation,
} from "./utils/continuation";
import { loginWithKakaoNative } from "./utils/kakao-native";

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

export const useCompleteKakaoSignup = () => {
  const [mutate, result] = useMutation(COMPLETE_KAKAO_SIGNUP_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      kakaoPhoneVerificationToken,
      ...profile
    }: SignupProfileInput & {
      readonly kakaoPhoneVerificationToken: string;
    }) => {
      const { data } = await mutate({
        variables: {
          input: {
            ...profile,
            kakaoPhoneVerificationToken,
          },
        },
      });

      return mapCompleteKakaoSignupResult(data);
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
      router.push("/signup");
    } catch {
      Alert.alert("카카오 로그인을 완료하지 못했어요");
    }
  };

  return { pending: kakaoLogin.isPending, submit };
};

export const useSignup = () => {
  const continuation = useAuthContinuation();
  const kakaoToken = continuation?.kakaoToken;
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<Gender>();
  const [heightCm, setHeightCm] = useState("");
  const [job, setJob] = useState("");
  const [mbti, setMbti] = useState("");
  const [photoUri, setPhotoUri] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setSession } = useSession();
  const completeKakao = useCompleteKakaoSignup();

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
      if (!current?.kakaoToken) {
        router.replace("/");
        return;
      }
      if (!gender) {
        Alert.alert("성별을 선택해주세요");
        return;
      }

      const parsedHeight = Number(heightCm);
      const profile: SignupProfileInput = {
        gender,
        heightCm: heightCm.trim() && Number.isFinite(parsedHeight) ? parsedHeight : undefined,
        job: job.trim() || undefined,
        mbti: mbti.trim() || undefined,
        termsAccepted,
        userName: userName.trim(),
      };
      const result = await completeKakao.mutateAsync({
        kakaoPhoneVerificationToken: current.kakaoToken,
        ...profile,
      });
      await clearAuthContinuation();
      await setSession(result.session);
      router.replace("/matches");
    } catch {
      Alert.alert("가입을 완료하지 못했어요", "입력한 내용을 확인한 뒤 다시 시도해주세요.");
    }
  };

  return {
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
    pending: completeKakao.isPending,
    submit,
  };
};
