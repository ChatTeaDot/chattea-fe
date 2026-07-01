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
        return { verifyPhoneCode: { status: "SIGNUP_REQUIRED", signupToken: "signup-token" } } as T;
      }

      if (query.includes("LoginWithKakao")) {
        return {
          loginWithKakao: {
            __typename: "KakaoRequiresPhonePayload",
            requiresPhone: true,
            kakaoToken: "kakao-token",
            nickname: "tea",
          },
        } as T;
      }

      if (query.includes("CompleteKakaoPhoneSignup")) {
        return {
          completeKakaoPhoneSignup: {
            session: { token: "session-token", userId: "user-id" },
            user: { id: "user-id", nickname: "tea", intro: "소개" },
          },
        } as T;
      }

      if (query.includes("AttachPhoneToMe")) {
        return {
          attachPhoneToMe: {
            session: { token: "session-token", userId: "user-id" },
            user: { id: "user-id", nickname: "tea", intro: "소개" },
          },
        } as T;
      }

      return {
        completePhoneSignup: {
          session: { token: "session-token", userId: "user-id" },
          user: { id: "user-id", nickname: "tea", intro: "소개" },
        },
      } as T;
    });

    await expect(requestPhoneCode("+821012345678")).resolves.toEqual({ ok: true });
    await expect(verifyPhoneCode("+821012345678", "123456")).resolves.toEqual({
      status: "SIGNUP_REQUIRED",
      signupToken: "signup-token",
    });
    await expect(completePhoneSignup("signup-token", "tea", "소개")).resolves.toMatchObject({
      user: { nickname: "tea" },
    });
    await expect(loginWithKakao("access-token")).resolves.toMatchObject({
      kakaoToken: "kakao-token",
      requiresPhone: true,
    });
    await expect(
      completeKakaoPhoneSignup("kakao-token", "signup-token", "tea", "소개"),
    ).resolves.toMatchObject({
      user: { nickname: "tea" },
    });
    await expect(attachPhoneToMe("kakao-token", "+821012345678", "123456")).resolves.toMatchObject({
      user: { nickname: "tea" },
    });

    expect(calls.map((call) => call.variables)).toEqual([
      { phone: "+821012345678" },
      { phone: "+821012345678", code: "123456" },
      { signupToken: "signup-token", nickname: "tea", intro: "소개", termsAccepted: true },
      { accessToken: "access-token" },
      {
        kakaoToken: "kakao-token",
        signupToken: "signup-token",
        nickname: "tea",
        intro: "소개",
        termsAccepted: true,
      },
      { kakaoToken: "kakao-token", phone: "+821012345678", code: "123456" },
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
