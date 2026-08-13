import { useMutation } from "@apollo/client/react";

import {
  ATTACH_PHONE_TO_ME_MUTATION,
  COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION,
  COMPLETE_PHONE_SIGNUP_MUTATION,
  LOGIN_WITH_KAKAO_MUTATION,
  mapAttachPhoneToMeResult,
  mapCompleteKakaoPhoneSignupResult,
  mapCompletePhoneSignupResult,
  mapLoginWithKakaoResult,
  mapRequestPhoneCodeResult,
  mapVerifyPhoneCodeResult,
  REQUEST_PHONE_CODE_MUTATION,
  VERIFY_PHONE_CODE_MUTATION,
} from "./api";
import type { Gender } from "./types";

export const useRequestPhoneCode = () => {
  const [mutate, result] = useMutation(REQUEST_PHONE_CODE_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async (phoneE164: string) => {
      const { data } = await mutate({
        variables: { input: { phone: phoneE164, purpose: "signup" } },
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
    }: {
      readonly signupToken: string;
      readonly userName: string;
      readonly gender: Gender;
      readonly email: string;
      readonly password: string;
    }) => {
      const { data } = await mutate({
        variables: {
          input: { phoneVerificationToken: signupToken, userName, gender, email, password },
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
    }: {
      readonly kakaoPhoneVerificationToken: string;
      readonly signupToken: string;
      readonly userName: string;
      readonly gender: Gender;
    }) => {
      const { data } = await mutate({
        variables: {
          input: {
            kakaoPhoneVerificationToken,
            phoneVerificationToken: signupToken,
            userName,
            gender,
          },
        },
      });

      return mapCompleteKakaoPhoneSignupResult(data);
    },
  };
};

export const useAttachPhoneToMe = () => {
  const [mutate, result] = useMutation(ATTACH_PHONE_TO_ME_MUTATION);

  return {
    ...result,
    isPending: result.loading,
    mutateAsync: async ({
      kakaoToken: _kakaoToken,
      phone,
      code,
    }: {
      readonly kakaoToken: string;
      readonly phone: string;
      readonly code: string;
    }) => {
      const { data } = await mutate({ variables: { input: { phone, code } } });

      return mapAttachPhoneToMeResult(data);
    },
  };
};
