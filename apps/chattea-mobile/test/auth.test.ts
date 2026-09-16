import { ApolloLink, Observable } from "@apollo/client";
import { GraphQLError, print } from "graphql";
import { describe, expect, it } from "vitest";

import { completeKakaoSignup, loginWithKakao } from "../src/features/auth/api";
import { apolloClient } from "../src/shared/graphql";
import { getGraphQLAuthorizationHeaders, setGraphQLSession } from "../src/shared/graphql/client";

type GraphQLCall = {
  readonly operationName: string;
  readonly query: string;
  readonly variables: Record<string, unknown>;
};

const authMutationData = (operationName: string): Record<string, unknown> => {
  switch (operationName) {
    case "LoginWithKakao":
      return {
        loginWithKakao: {
          __typename: "KakaoRequiresPhonePayload",
          requiresPhone: true,
          kakaoPhoneVerificationToken: "kakao-token",
          userName: "tea",
        },
      };
    case "CompleteKakaoSignup":
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

describe("kakao auth", () => {
  it("uses backend GraphQL kakao mutations", async () => {
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
      await expect(loginWithKakao("access-token")).resolves.toMatchObject({
        kakaoPhoneVerificationToken: "kakao-token",
        requiresPhone: true,
      });
      await expect(
        completeKakaoSignup("kakao-token", {
          gender: "female",
          termsAccepted: true,
          userName: "tea",
        }),
      ).resolves.toMatchObject({
        session: { accessToken: "session-token", refreshToken: "refresh-token" },
      });
    });

    expect(calls.map((call) => call.operationName)).toEqual([
      "LoginWithKakao",
      "CompleteKakaoSignup",
    ]);
    expect(calls.map((call) => call.variables)).toEqual([
      { accessToken: "access-token" },
      {
        input: {
          kakaoPhoneVerificationToken: "kakao-token",
          userName: "tea",
          gender: "female",
          termsAccepted: true,
        },
      },
    ]);
    expect(calls.every((call) => call.query.includes("mutation"))).toBe(true);
    expect(calls[1]?.query).toContain("refreshToken");
  });

  it("surfaces Apollo GraphQL mutation errors", async () => {
    const link = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({ errors: [new GraphQLError("kakao login rejected")] });
          observer.complete();
        }),
    );

    await withApolloLink(link, async () => {
      await expect(loginWithKakao("access-token")).rejects.toThrow("kakao login rejected");
    });
  });

  it("shares session token headers with HTTP and WebSocket GraphQL clients", () => {
    setGraphQLSession({ accessToken: "session-token", refreshToken: "refresh-token" });
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: "Bearer session-token",
    });

    setGraphQLSession(null);
    expect(getGraphQLAuthorizationHeaders()).toEqual({});
  });
});
