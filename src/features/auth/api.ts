import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type {
  CompletePhoneSignupResult,
  Gender,
  KakaoLoginResult,
  Session,
  VerifyPhoneResult,
} from "./types";

export type RequestPhoneCodeMutation = {
  readonly requestPhoneCode: {
    readonly ok: boolean;
  };
};

export type RequestPhoneCodeVariables = {
  readonly input: {
    readonly phone: string;
    readonly purpose: "signup";
  };
};

export type VerifyPhoneCodeMutation = {
  readonly verifyPhoneCode: {
    readonly existingUser: boolean;
    readonly phoneVerificationToken?: string | null;
    readonly tokenPayload?: {
      readonly accessToken: string;
    } | null;
  };
};

export type VerifyPhoneCodeVariables = {
  readonly input: {
    readonly phone: string;
    readonly code: string;
  };
};

export type CompletePhoneSignupMutation = {
  readonly completePhoneSignup: {
    readonly accessToken: string;
  };
};

export type CompletePhoneSignupVariables = {
  readonly input: {
    readonly phoneVerificationToken: string;
    readonly userName: string;
    readonly gender: Gender;
    readonly email: string;
    readonly password: string;
  };
};

export type LoginWithKakaoMutation = {
  readonly loginWithKakao:
    | {
        readonly __typename: "KakaoLoginSuccessPayload";
        readonly requiresPhone: false;
        readonly session: {
          readonly accessToken: string;
        };
      }
    | {
        readonly __typename: "KakaoRequiresPhonePayload";
        readonly requiresPhone: true;
        readonly kakaoPhoneVerificationToken: string;
        readonly userName: string | null;
      };
};

export type LoginWithKakaoVariables = {
  readonly accessToken: string;
};

export type CompleteKakaoPhoneSignupMutation = {
  readonly completeKakaoPhoneSignup: {
    readonly accessToken: string;
  };
};

export type CompleteKakaoPhoneSignupVariables = {
  readonly input: {
    readonly kakaoPhoneVerificationToken: string;
    readonly phoneVerificationToken: string;
    readonly userName: string;
    readonly gender: Gender;
  };
};

export type AttachPhoneToMeMutation = {
  readonly attachPhoneToMe: boolean;
};

export type AttachPhoneToMeVariables = {
  readonly input: {
    readonly phone: string;
    readonly code: string;
  };
};

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
    }
  }
`;

export const ATTACH_PHONE_TO_ME_MUTATION: TypedDocumentNode<
  AttachPhoneToMeMutation,
  AttachPhoneToMeVariables
> = gql`
  mutation AttachPhoneToMe($input: AttachPhoneToMeInput!) {
    attachPhoneToMe(input: $input)
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

  return result.existingUser
    ? { status: "LOGIN", session: tokenPayloadToSession(result.tokenPayload) }
    : { status: "SIGNUP_REQUIRED", signupToken: result.phoneVerificationToken ?? "" };
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

export const mapAttachPhoneToMeResult = (
  data: AttachPhoneToMeMutation | null | undefined,
): boolean => requireMutationData(data).attachPhoneToMe;

export const requestPhoneCode = async (phoneE164: string) => {
  const { data } = await apolloClient.mutate({
    mutation: REQUEST_PHONE_CODE_MUTATION,
    variables: { input: { phone: phoneE164, purpose: "signup" } },
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
): Promise<CompletePhoneSignupResult> => {
  const { data } = await apolloClient.mutate({
    mutation: COMPLETE_PHONE_SIGNUP_MUTATION,
    variables: {
      input: { phoneVerificationToken: signupToken, userName, gender, email, password },
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
): Promise<CompletePhoneSignupResult> => {
  const { data } = await apolloClient.mutate({
    mutation: COMPLETE_KAKAO_PHONE_SIGNUP_MUTATION,
    variables: {
      input: { kakaoPhoneVerificationToken, phoneVerificationToken: signupToken, userName, gender },
    },
  });

  return mapCompleteKakaoPhoneSignupResult(data);
};

export const attachPhoneToMe = async (
  _kakaoToken: string,
  phoneE164: string,
  code: string,
): Promise<boolean> => {
  const { data } = await apolloClient.mutate({
    mutation: ATTACH_PHONE_TO_ME_MUTATION,
    variables: { input: { phone: phoneE164, code } },
  });

  return mapAttachPhoneToMeResult(data);
};

const requireMutationData = <T>(data: T | null | undefined): T => {
  if (data === null || data === undefined) {
    throw new Error("MISSING_AUTH_MUTATION_DATA");
  }

  return data;
};

const tokenPayloadToSession = (
  tokenPayload?: { readonly accessToken: string } | null,
): Session => ({
  token: tokenPayload?.accessToken ?? "",
});
