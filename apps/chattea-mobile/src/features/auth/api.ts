import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type {
  CompleteKakaoSignupMutation,
  CompleteKakaoSignupResult,
  CompleteKakaoSignupVariables,
  KakaoLoginResult,
  LoginWithKakaoMutation,
  LoginWithKakaoVariables,
  Session,
  SignupProfileInput,
} from "./types";

export const LOGIN_WITH_KAKAO_MUTATION: TypedDocumentNode<
  LoginWithKakaoMutation,
  LoginWithKakaoVariables
> = gql`
  mutation LoginWithKakao($accessToken: String!) {
    loginWithKakao(accessToken: $accessToken) {
      __typename
      ... on KakaoLoginSuccessPayload {
        requiresPhone
        session {
          accessToken
          refreshToken
        }
      }
      ... on KakaoRequiresPhonePayload {
        requiresPhone
        kakaoPhoneVerificationToken
        userName
      }
    }
  }
`;

export const COMPLETE_KAKAO_SIGNUP_MUTATION: TypedDocumentNode<
  CompleteKakaoSignupMutation,
  CompleteKakaoSignupVariables
> = gql`
  mutation CompleteKakaoSignup($input: CompleteKakaoPhoneSignupInput!) {
    completeKakaoPhoneSignup(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const mapLoginWithKakaoResult = (
  data: LoginWithKakaoMutation | null | undefined,
): KakaoLoginResult => {
  const result = requireMutationData(data).loginWithKakao;

  return result.requiresPhone
    ? result
    : {
        __typename: "KakaoLoginSuccessPayload",
        requiresPhone: false,
        session: tokenPayloadToSession(result.session),
      };
};

export const mapCompleteKakaoSignupResult = (
  data: CompleteKakaoSignupMutation | null | undefined,
): CompleteKakaoSignupResult => {
  return { session: tokenPayloadToSession(requireMutationData(data).completeKakaoPhoneSignup) };
};

export const loginWithKakao = async (accessToken: string): Promise<KakaoLoginResult> => {
  const { data } = await apolloClient.mutate({
    mutation: LOGIN_WITH_KAKAO_MUTATION,
    variables: { accessToken },
  });

  return mapLoginWithKakaoResult(data);
};

export const completeKakaoSignup = async (
  kakaoPhoneVerificationToken: string,
  profile: SignupProfileInput,
): Promise<CompleteKakaoSignupResult> => {
  const { data } = await apolloClient.mutate({
    mutation: COMPLETE_KAKAO_SIGNUP_MUTATION,
    variables: {
      input: {
        ...profile,
        kakaoPhoneVerificationToken,
      },
    },
  });

  return mapCompleteKakaoSignupResult(data);
};

const requireMutationData = <T>(data: T | null | undefined): T => {
  if (data === null || data === undefined) {
    throw new Error("MISSING_AUTH_MUTATION_DATA");
  }

  return data;
};

const tokenPayloadToSession = (
  tokenPayload?: { readonly accessToken: string; readonly refreshToken: string } | null,
): Session => {
  if (!tokenPayload?.accessToken || !tokenPayload.refreshToken) {
    throw new Error("MISSING_AUTH_TOKEN_PAYLOAD");
  }
  return {
    accessToken: tokenPayload.accessToken,
    refreshToken: tokenPayload.refreshToken,
  };
};
