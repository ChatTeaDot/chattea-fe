import { gql } from "graphql-request";

import { graphQLRequest, type Requester, setGraphQLRequester } from "@/shared/graphql/client";

import { CompletePhoneSignupResult, Gender, KakaoLoginResult, Session, VerifyPhoneResult } from "./types";

export const setAuthApiRequester = (requester: Requester) => {
  setGraphQLRequester(requester);
};

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

export const requestPhoneCode = async (phoneE164: string) => {
  const data = await graphQLRequest<{ requestPhoneCode: { ok: boolean } }>(
    gql`
      mutation RequestPhoneCode($input: RequestPhoneCodeInput!) {
        requestPhoneCode(input: $input) {
          ok
        }
      }
    `,
    { input: { phone: phoneE164, purpose: "signup" } },
  );

  return data.requestPhoneCode;
};

export const verifyPhoneCode = async (
  phoneE164: string,
  code: string,
): Promise<VerifyPhoneResult> => {
  const data = await graphQLRequest<{
    verifyPhoneCode: {
      existingUser: boolean;
      phoneVerificationToken?: string | null;
      tokenPayload?: { accessToken: string } | null;
    };
  }>(
    gql`
      mutation VerifyPhoneCode($input: VerifyPhoneCodeInput!) {
        verifyPhoneCode(input: $input) {
          existingUser
          phoneVerificationToken
          tokenPayload {
            accessToken
          }
        }
      }
    `,
    { input: { phone: phoneE164, code } },
  );

  return data.verifyPhoneCode.existingUser
    ? { status: "LOGIN", session: tokenPayloadToSession(data.verifyPhoneCode.tokenPayload) }
    : { status: "SIGNUP_REQUIRED", signupToken: data.verifyPhoneCode.phoneVerificationToken ?? "" };
};

export const completePhoneSignup = async (
  signupToken: string,
  userName: string,
  gender: Gender,
  email: string,
  password: string,
): Promise<CompletePhoneSignupResult> => {
  const data = await graphQLRequest<{ completePhoneSignup: { accessToken: string } }>(
    gql`
      mutation CompletePhoneSignup($input: CompletePhoneSignupInput!) {
        completePhoneSignup(input: $input) {
          accessToken
        }
      }
    `,
    { input: { phoneVerificationToken: signupToken, userName, gender, email, password } },
  );

  return { session: tokenPayloadToSession(data.completePhoneSignup) };
};

export const loginWithKakao = async (accessToken: string): Promise<KakaoLoginResult> => {
  const data = await graphQLRequest<{
    loginWithKakao:
      | { __typename: "KakaoLoginSuccessPayload"; requiresPhone: false; session: { accessToken: string } }
      | {
          __typename: "KakaoRequiresPhonePayload";
          requiresPhone: true;
          kakaoPhoneVerificationToken: string;
          userName: string | null;
        };
  }>(
    gql`
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
    `,
    { accessToken },
  );

  return data.loginWithKakao.requiresPhone
    ? data.loginWithKakao
    : {
        __typename: "KakaoLoginSuccessPayload",
        requiresPhone: false,
        session: tokenPayloadToSession(data.loginWithKakao.session),
      };
};

export const completeKakaoPhoneSignup = async (
  kakaoPhoneVerificationToken: string,
  signupToken: string,
  userName: string,
  gender: Gender,
): Promise<CompletePhoneSignupResult> => {
  const data = await graphQLRequest<{ completeKakaoPhoneSignup: { accessToken: string } }>(
    gql`
      mutation CompleteKakaoPhoneSignup($input: CompleteKakaoPhoneSignupInput!) {
        completeKakaoPhoneSignup(input: $input) {
          accessToken
        }
      }
    `,
    { input: { kakaoPhoneVerificationToken, phoneVerificationToken: signupToken, userName, gender } },
  );

  return { session: tokenPayloadToSession(data.completeKakaoPhoneSignup) };
};

export const attachPhoneToMe = async (
  _kakaoToken: string,
  phoneE164: string,
  code: string,
): Promise<boolean> => {
  const data = await graphQLRequest<{ attachPhoneToMe: boolean }>(
    gql`
      mutation AttachPhoneToMe($input: AttachPhoneToMeInput!) {
        attachPhoneToMe(input: $input)
      }
    `,
    { input: { phone: phoneE164, code } },
  );

  return data.attachPhoneToMe;
};

const tokenPayloadToSession = (tokenPayload?: { accessToken: string } | null): Session => ({
  token: tokenPayload?.accessToken ?? "",
});
