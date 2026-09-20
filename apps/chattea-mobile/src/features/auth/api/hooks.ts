import { useMutation } from "@apollo/client/react";

import {
  COMPLETE_KAKAO_SIGNUP_MUTATION,
  LOGIN_WITH_KAKAO_MUTATION,
  mapCompleteKakaoSignupResult,
  mapLoginWithKakaoResult,
} from "./fetchers";
import type { SignupProfileInput } from "./schemas";

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
