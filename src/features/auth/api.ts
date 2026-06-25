import { gql } from "graphql-request";
import { graphQLRequest, setGraphQLRequester, type Requester } from "../../shared/graphql/client";
import { CompletePhoneSignupResult, KakaoLoginResult, VerifyPhoneResult } from "./types";

export function setAuthApiRequester(requester: Requester) {
  setGraphQLRequester(requester);
}

export function normalizeKoreanPhone(input: string): string {
  const compact = input.replace(/[\s-]/g, "");

  if (compact.startsWith("+82") && /^10\d{8}$/.test(compact.slice(3))) {
    return compact;
  }

  if (compact.startsWith("010") && /^10\d{8}$/.test(compact.slice(1))) {
    return `+82${compact.slice(1)}`;
  }

  throw new Error("INVALID_KOREAN_PHONE");
}

export async function requestPhoneCode(phoneE164: string) {
  const data = await graphQLRequest<{ requestPhoneCode: { ok: boolean } }>(
    gql`
      mutation RequestPhoneCode($phone: String!) {
        requestPhoneCode(phone: $phone) {
          ok
        }
      }
    `,
    { phone: phoneE164 },
  );

  return data.requestPhoneCode;
}

export async function verifyPhoneCode(phoneE164: string, code: string): Promise<VerifyPhoneResult> {
  const data = await graphQLRequest<{ verifyPhoneCode: VerifyPhoneResult }>(
    gql`
      mutation VerifyPhoneCode($phone: String!, $code: String!) {
        verifyPhoneCode(phone: $phone, code: $code) {
          __typename
          ... on LoginPayload {
            status
            session {
              token
              userId
            }
            user {
              id
              nickname
              intro
            }
          }
          ... on SignupRequiredPayload {
            status
            signupToken
          }
        }
      }
    `,
    { phone: phoneE164, code },
  );

  return data.verifyPhoneCode;
}

export async function completePhoneSignup(
  signupToken: string,
  nickname: string,
  intro = "",
): Promise<CompletePhoneSignupResult> {
  const data = await graphQLRequest<{ completePhoneSignup: CompletePhoneSignupResult }>(
    gql`
      mutation CompletePhoneSignup(
        $signupToken: String!
        $nickname: String!
        $intro: String
        $termsAccepted: Boolean!
      ) {
        completePhoneSignup(
          signupToken: $signupToken
          nickname: $nickname
          intro: $intro
          termsAccepted: $termsAccepted
        ) {
          session {
            token
            userId
          }
          user {
            id
            nickname
            intro
          }
        }
      }
    `,
    { signupToken, nickname, intro, termsAccepted: true },
  );

  return data.completePhoneSignup;
}

export async function loginWithKakao(accessToken: string): Promise<KakaoLoginResult> {
  const data = await graphQLRequest<{ loginWithKakao: KakaoLoginResult }>(
    gql`
      mutation LoginWithKakao($accessToken: String!) {
        loginWithKakao(accessToken: $accessToken) {
          __typename
          ... on KakaoLoginSuccessPayload {
            requiresPhone
            session {
              token
              userId
            }
            user {
              id
              nickname
              intro
            }
          }
          ... on KakaoRequiresPhonePayload {
            requiresPhone
            kakaoToken
            nickname
          }
        }
      }
    `,
    { accessToken },
  );

  return data.loginWithKakao;
}

export async function completeKakaoPhoneSignup(
  kakaoToken: string,
  signupToken: string,
  nickname: string,
  intro = "",
): Promise<CompletePhoneSignupResult> {
  const data = await graphQLRequest<{ completeKakaoPhoneSignup: CompletePhoneSignupResult }>(
    gql`
      mutation CompleteKakaoPhoneSignup(
        $kakaoToken: String!
        $signupToken: String!
        $nickname: String!
        $intro: String
        $termsAccepted: Boolean!
      ) {
        completeKakaoPhoneSignup(
          kakaoToken: $kakaoToken
          signupToken: $signupToken
          nickname: $nickname
          intro: $intro
          termsAccepted: $termsAccepted
        ) {
          session {
            token
            userId
          }
          user {
            id
            nickname
            intro
          }
        }
      }
    `,
    { kakaoToken, signupToken, nickname, intro, termsAccepted: true },
  );

  return data.completeKakaoPhoneSignup;
}

export async function attachPhoneToMe(
  kakaoToken: string,
  phoneE164: string,
  code: string,
): Promise<CompletePhoneSignupResult> {
  const data = await graphQLRequest<{ attachPhoneToMe: CompletePhoneSignupResult }>(
    gql`
      mutation AttachPhoneToMe($kakaoToken: String!, $phone: String!, $code: String!) {
        attachPhoneToMe(kakaoToken: $kakaoToken, phone: $phone, code: $code) {
          session {
            token
            userId
          }
          user {
            id
            nickname
            intro
          }
        }
      }
    `,
    { kakaoToken, phone: phoneE164, code },
  );

  return data.attachPhoneToMe;
}
