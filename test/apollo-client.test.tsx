import { gql, type TypedDocumentNode } from "@apollo/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApolloProvider } from "../src/providers/apollo-provider";
import { apolloClient, setGraphQLSessionToken } from "../src/shared/graphql";

type ViewerQuery = {
  readonly viewer: {
    readonly id: string;
  };
};

const VIEWER_QUERY: TypedDocumentNode<ViewerQuery> = gql`
  query Viewer {
    viewer {
      id
    }
  }
`;

describe("Apollo GraphQL infrastructure", () => {
  afterEach(() => {
    setGraphQLSessionToken(null);
    vi.unstubAllGlobals();
  });

  it("sends the current session token when a query runs", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { viewer: { id: "viewer-1" } } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSessionToken("session-token");

    await apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    const request = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get("authorization")).toBe("Bearer session-token");
  });

  it("provides the shared Apollo client", () => {
    const child = "child";

    const element = ApolloProvider({ children: child });

    expect(element.props.client).toBe(apolloClient);
    expect(element.props.children).toBe(child);
  });

  it("clears cached user data when the session token changes", () => {
    apolloClient.cache.writeQuery({
      data: { viewer: { id: "viewer-1" } },
      query: VIEWER_QUERY,
    });

    setGraphQLSessionToken("next-session-token");

    expect(apolloClient.cache.extract()).toEqual({});
  });
});
