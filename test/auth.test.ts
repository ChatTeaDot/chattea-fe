import { describe, expect, it } from "vitest";

import {
  attachPhoneToMe,
  completeKakaoPhoneSignup,
  completePhoneSignup,
  loginWithKakao,
  normalizeKoreanPhone,
  requestPhoneCode,
  verifyPhoneCode,
} from "../src/features/auth/api";
import { getNextResendSeconds, getResendTitle } from "../src/features/auth/resend-timer";
import {
  getGraphQLAuthorizationHeaders,
  setGraphQLRequester,
  setGraphQLSessionToken,
} from "../src/shared/graphql/client";

describe("normalizeKoreanPhone", () => {
  it("normalizes supported Korean mobile formats", () => {
    expect(normalizeKoreanPhone("01012345678")).toBe("+821012345678");
    expect(normalizeKoreanPhone("010-1234-5678")).toBe("+821012345678");
  });

  it("rejects unsupported numbers", () => {
    expect(() => normalizeKoreanPhone("+14155550100")).toThrow("INVALID_KOREAN_PHONE");
  });

  it("uses backend GraphQL phone mutations", async () => {
    const calls: { query: string; variables?: Record<string, unknown> }[] = [];
    setGraphQLRequester(async <T>(query: string, variables?: Record<string, unknown>) => {
      calls.push({ query, variables });

      if (query.includes("RequestPhoneCode")) {
        return { requestPhoneCode: { ok: true } } as T;
      }

      if (query.includes("VerifyPhoneCode")) {
        return {
          verifyPhoneCode: {
            existingUser: false,
            phoneVerificationToken: "signup-token",
            tokenPayload: null,
          },
        } as T;
      }

      if (query.includes("LoginWithKakao")) {
        return {
          loginWithKakao: {
            __typename: "KakaoRequiresPhonePayload",
            requiresPhone: true,
            kakaoPhoneVerificationToken: "kakao-token",
            userName: "tea",
          },
        } as T;
      }

      if (query.includes("CompleteKakaoPhoneSignup")) {
        return {
          completeKakaoPhoneSignup: {
            accessToken: "session-token",
          },
        } as T;
      }

      if (query.includes("AttachPhoneToMe")) {
        return { attachPhoneToMe: true } as T;
      }

      return {
        completePhoneSignup: {
          accessToken: "session-token",
        },
      } as T;
    });

    await expect(requestPhoneCode("+821012345678")).resolves.toEqual({ ok: true });
    await expect(verifyPhoneCode("+821012345678", "123456")).resolves.toEqual({
      status: "SIGNUP_REQUIRED",
      signupToken: "signup-token",
    });
    await expect(completePhoneSignup("signup-token", "tea", "tea@example.com", "password")).resolves.toMatchObject({
      session: { token: "session-token" },
    });
    await expect(loginWithKakao("access-token")).resolves.toMatchObject({
      kakaoPhoneVerificationToken: "kakao-token",
      requiresPhone: true,
    });
    await expect(completeKakaoPhoneSignup("kakao-token", "signup-token", "tea")).resolves.toMatchObject({
      session: { token: "session-token" },
    });
    await expect(attachPhoneToMe("kakao-token", "+821012345678", "123456")).resolves.toBe(true);

    expect(calls.map((call) => call.variables)).toEqual([
      { input: { phone: "+821012345678", purpose: "signup" } },
      { input: { phone: "+821012345678", code: "123456" } },
      {
        input: {
          phoneVerificationToken: "signup-token",
          userName: "tea",
          email: "tea@example.com",
          password: "password",
        },
      },
      { accessToken: "access-token" },
      {
        input: {
          kakaoPhoneVerificationToken: "kakao-token",
          phoneVerificationToken: "signup-token",
          userName: "tea",
        },
      },
      { input: { phone: "+821012345678", code: "123456" } },
    ]);
  });

  it("shares session token headers with HTTP and WebSocket GraphQL clients", () => {
    setGraphQLSessionToken("session-token");
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: "Bearer session-token",
    });

    setGraphQLSessionToken(null);
    expect(getGraphQLAuthorizationHeaders()).toEqual({});
  });

  it("formats the phone code resend timer", () => {
    expect(getNextResendSeconds(60)).toBe(59);
    expect(getNextResendSeconds(0)).toBe(0);
    expect(getResendTitle(3)).toBe("재전송 3초");
    expect(getResendTitle(0)).toBe("인증번호 재전송");
  });
});
