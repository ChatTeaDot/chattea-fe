import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type {
  CompleteKakaoPhoneSignupMutation,
  CompleteKakaoPhoneSignupVariables,
  CompletePhoneSignupMutation,
  CompletePhoneSignupResult,
  CompletePhoneSignupVariables,
  Gender,
  KakaoLoginResult,
  LoginWithKakaoMutation,
  LoginWithKakaoVariables,
  RequestPhoneCodeMutation,
  RequestPhoneCodeVariables,
  Session,
  VerifyPhoneCodeMutation,
  VerifyPhoneCodeVariables,
  VerifyPhoneResult,
} from "./types";

export const REQUEST_PHONE_CODE_MUTATION: TypedDocumentNode<
  RequestPhoneCodeMutation,
  RequestPhoneCodeVariables
> = gql`
  mutation RequestPhoneCode($input: RequestPhoneCodeInput!) {
    requestPhoneCode(input: $input) {
      ok
    }
  }
`;

export const VERIFY_PHONE_CODE_MUTATION: TypedDocumentNode<
  VerifyPhoneCodeMutation,
  VerifyPhoneCodeVariables
> = gql`
  mutation VerifyPhoneCode($input: VerifyPhoneCodeInput!) {
    verifyPhoneCode(input: $input) {
      existingUser
      phoneVerificationToken
      tokenPayload {
        accessToken
        refreshToken
      }
    }
  }
`;

export const COMPLETE_PHONE_SIGNUP_MUTATION: TypedDocumentNode<
  CompletePhoneSignupMutation,
  CompletePhoneSignupVariables
> = gql`
  mutation CompletePhoneSignup($input: CompletePhoneSignupInput!) {
    completePhoneSignup(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

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

export const COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION: TypedDocumentNode<
  CompleteKakaoPhoneSignupMutation,
  CompleteKakaoPhoneSignupVariables
> = gql`
  mutation CompleteKakaoPhoneSignup($input: CompleteKakaoPhoneSignupInput!) {
    completeKakaoPhoneSignup(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const normalizeKoreanPhone = (input: string): string => {
  const compact = input.replace(/[\s-]/g, "");

  if (compact.startsWith("+82") && /^10\d{8}$/.test(compact.slice(3))) {
    return compact;
  }

  if (compact.startsWith("010") && /^10\d{8}$/.test(compact.slice(1))) {
    return `+82${compact.slice(1)}`;
  }

  throw new Error("INVALID_KOREAN_PHONE");
};

export const mapRequestPhoneCodeResult = (data: RequestPhoneCodeMutation | null | undefined) =>
  requireMutationData(data).requestPhoneCode;

export const mapVerifyPhoneCodeResult = (
  data: VerifyPhoneCodeMutation | null | undefined,
): VerifyPhoneResult => {
  const result = requireMutationData(data).verifyPhoneCode;

  if (result.existingUser) {
    return { status: "LOGIN", session: tokenPayloadToSession(result.tokenPayload) };
  }
  if (!result.phoneVerificationToken) throw new Error("MISSING_PHONE_VERIFICATION_TOKEN");
  return { status: "SIGNUP_REQUIRED", signupToken: result.phoneVerificationToken };
};

export const mapCompletePhoneSignupResult = (
  data: CompletePhoneSignupMutation | null | undefined,
): CompletePhoneSignupResult => {
  return { session: tokenPayloadToSession(requireMutationData(data).completePhoneSignup) };
};

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

export const mapCompleteKakaoPhoneSignupResult = (
  data: CompleteKakaoPhoneSignupMutation | null | undefined,
): CompletePhoneSignupResult => {
  return { session: tokenPayloadToSession(requireMutationData(data).completeKakaoPhoneSignup) };
};

export const requestPhoneCode = async (phoneE164: string) => {
  const { data } = await apolloClient.mutate({
    mutation: REQUEST_PHONE_CODE_MUTATION,
    variables: { input: { phone: phoneE164, purpose: "Signup" } },
  });

  return mapRequestPhoneCodeResult(data);
};

export const verifyPhoneCode = async (
  phoneE164: string,
  code: string,
): Promise<VerifyPhoneResult> => {
  const { data } = await apolloClient.mutate({
    mutation: VERIFY_PHONE_CODE_MUTATION,
    variables: { input: { phone: phoneE164, code } },
  });

  return mapVerifyPhoneCodeResult(data);
};

export const completePhoneSignup = async (
  signupToken: string,
  userName: string,
  gender: Gender,
  email: string,
  password: string,
  termsAccepted: boolean,
): Promise<CompletePhoneSignupResult> => {
  const { data } = await apolloClient.mutate({
    mutation: COMPLETE_PHONE_SIGNUP_MUTATION,
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
};

export const loginWithKakao = async (accessToken: string): Promise<KakaoLoginResult> => {
  const { data } = await apolloClient.mutate({
    mutation: LOGIN_WITH_KAKAO_MUTATION,
    variables: { accessToken },
  });

  return mapLoginWithKakaoResult(data);
};

export const completeKakaoPhoneSignup = async (
  kakaoPhoneVerificationToken: string,
  signupToken: string,
  userName: string,
  gender: Gender,
  termsAccepted: boolean,
): Promise<CompletePhoneSignupResult> => {
  const { data } = await apolloClient.mutate({
    mutation: COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION,
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
