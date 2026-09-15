import { ApolloLink, Observable } from "@apollo/client";
import { GraphQLError, print } from "graphql";
import { describe, expect, it } from "vitest";

import {
  completeKakaoPhoneSignup,
  completePhoneSignup,
  loginWithKakao,
  mapVerifyPhoneCodeResult,
  normalizeKoreanPhone,
  requestPhoneCode,
  verifyPhoneCode,
} from "../src/features/auth/api";
import { getNextResendSeconds, getResendTitle } from "../src/features/auth/utils/resend-timer";
import { apolloClient } from "../src/shared/graphql";
import { getGraphQLAuthorizationHeaders, setGraphQLSession } from "../src/shared/graphql/client";

type GraphQLCall = {
  readonly operationName: string;
  readonly query: string;
  readonly variables: Record<string, unknown>;
};

const authMutationData = (operationName: string): Record<string, unknown> => {
  switch (operationName) {
    case "RequestPhoneCode":
      return { requestPhoneCode: { ok: true } };
    case "VerifyPhoneCode":
      return {
        verifyPhoneCode: {
          existingUser: false,
          phoneVerificationToken: "signup-token",
          tokenPayload: null,
        },
      };
    case "CompletePhoneSignup":
      return {
        completePhoneSignup: { accessToken: "session-token", refreshToken: "refresh-token" },
      };
    case "LoginWithKakao":
      return {
        loginWithKakao: {
          __typename: "KakaoRequiresPhonePayload",
          requiresPhone: true,
          kakaoPhoneVerificationToken: "kakao-token",
          userName: "tea",
        },
      };
    case "CompleteKakaoPhoneSignup":
      return {
        completeKakaoPhoneSignup: {
          accessToken: "session-token",
          refreshToken: "refresh-token",
        },
      };
    default:
      throw new Error(`UNEXPECTED_AUTH_MUTATION:${operationName}`);
  }
};

const withApolloLink = async (link: ApolloLink, action: () => Promise<void>) => {
  const previousLink = apolloClient.link;
  apolloClient.setLink(link);

  try {
    await action();
  } finally {
    apolloClient.setLink(previousLink);
  }
};

describe("normalizeKoreanPhone", () => {
  it("normalizes supported Korean mobile formats", () => {
    expect(normalizeKoreanPhone("01012345678")).toBe("+821012345678");
    expect(normalizeKoreanPhone("010-1234-5678")).toBe("+821012345678");
  });

  it("rejects unsupported numbers", () => {
    expect(() => normalizeKoreanPhone("+14155550100")).toThrow("INVALID_KOREAN_PHONE");
  });

  it("uses backend GraphQL phone mutations", async () => {
    const calls: GraphQLCall[] = [];
    const link = new ApolloLink((operation) => {
      const operationName = operation.operationName ?? "UNNAMED_AUTH_MUTATION";
      calls.push({
        operationName,
        query: print(operation.query),
        variables: operation.variables,
      });

      return new Observable((observer) => {
        observer.next({ data: authMutationData(operationName) });
        observer.complete();
      });
    });

    await withApolloLink(link, async () => {
      await expect(requestPhoneCode("+821012345678")).resolves.toEqual({ ok: true });
      await expect(verifyPhoneCode("+821012345678", "123456")).resolves.toEqual({
        status: "SIGNUP_REQUIRED",
        signupToken: "signup-token",
      });
      await expect(
        completePhoneSignup("signup-token", "tea", "female", "tea@example.com", "password", true),
      ).resolves.toMatchObject({
        session: { accessToken: "session-token", refreshToken: "refresh-token" },
      });
      await expect(loginWithKakao("access-token")).resolves.toMatchObject({
        kakaoPhoneVerificationToken: "kakao-token",
        requiresPhone: true,
      });
      await expect(
        completeKakaoPhoneSignup("kakao-token", "signup-token", "tea", "female", true),
      ).resolves.toMatchObject({
        session: { accessToken: "session-token", refreshToken: "refresh-token" },
      });
    });

    expect(calls.map((call) => call.operationName)).toEqual([
      "RequestPhoneCode",
      "VerifyPhoneCode",
      "CompletePhoneSignup",
      "LoginWithKakao",
      "CompleteKakaoPhoneSignup",
    ]);
    expect(calls.map((call) => call.variables)).toEqual([
      { input: { phone: "+821012345678", purpose: "Signup" } },
      { input: { phone: "+821012345678", code: "123456" } },
      {
        input: {
          phoneVerificationToken: "signup-token",
          userName: "tea",
          gender: "female",
          email: "tea@example.com",
          password: "password",
          termsAccepted: true,
        },
      },
      { accessToken: "access-token" },
      {
        input: {
          kakaoPhoneVerificationToken: "kakao-token",
          phoneVerificationToken: "signup-token",
          userName: "tea",
          gender: "female",
          termsAccepted: true,
        },
      },
    ]);
    expect(calls.every((call) => call.query.includes("mutation"))).toBe(true);
    expect(calls[2]?.query).toContain("refreshToken");
    expect(calls[4]?.query).toContain("refreshToken");
  });

  it("surfaces Apollo GraphQL mutation errors", async () => {
    const link = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({ errors: [new GraphQLError("phone code rejected")] });
          observer.complete();
        }),
    );

    await withApolloLink(link, async () => {
      await expect(requestPhoneCode("+821012345678")).rejects.toThrow("phone code rejected");
    });
  });

  it("fails closed when an existing-user verification omits either session token", () => {
    expect(() =>
      mapVerifyPhoneCodeResult({
        verifyPhoneCode: {
          existingUser: true,
          phoneVerificationToken: null,
          tokenPayload: null,
        },
      }),
    ).toThrow("MISSING_AUTH_TOKEN_PAYLOAD");
  });

  it("fails closed when a new-user verification omits its signup token", () => {
    expect(() =>
      mapVerifyPhoneCodeResult({
        verifyPhoneCode: {
          existingUser: false,
          phoneVerificationToken: null,
          tokenPayload: null,
        },
      }),
    ).toThrow("MISSING_PHONE_VERIFICATION_TOKEN");
  });

  it("shares session token headers with HTTP and WebSocket GraphQL clients", () => {
    setGraphQLSession({ accessToken: "session-token", refreshToken: "refresh-token" });
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: "Bearer session-token",
    });

    setGraphQLSession(null);
    expect(getGraphQLAuthorizationHeaders()).toEqual({});
  });

  it("formats the phone code resend timer", () => {
    expect(getNextResendSeconds(60)).toBe(59);
    expect(getNextResendSeconds(0)).toBe(0);
    expect(getResendTitle(3)).toBe("재전송 3초");
    expect(getResendTitle(0)).toBe("인증번호 재전송");
  });
});
