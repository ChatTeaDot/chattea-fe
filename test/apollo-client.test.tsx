import { gql, type TypedDocumentNode } from "@apollo/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import ApolloProvider from "../src/providers/apollo-provider";
import {
  apolloClient,
  getGraphQLAuthorizationHeaders,
  revokeGraphQLSession,
  setGraphQLSession,
  setGraphQLSessionHandlers,
} from "../src/shared/graphql";

const secureStore = vi.hoisted(() => ({
  delayReads: false,
  pendingReads: [] as (() => void)[],
  values: new Map<string, string>(),
  writes: 0,
}));
const nativeCrypto = vi.hoisted(() => ({
  randomUUID: vi.fn(() => "37e62526-6f75-4fbc-9df8-10fabd98929b"),
}));

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => {
    const value = secureStore.values.get(key) ?? null;
    if (secureStore.delayReads) {
      await new Promise<void>((resolve) => secureStore.pendingReads.push(resolve));
    }
    return value;
  }),
  setItemAsync: vi.fn((key: string, value: string) => {
    secureStore.writes += 1;
    secureStore.values.set(key, value);
    return Promise.resolve();
  }),
}));
vi.mock("expo-crypto", () => nativeCrypto);

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

const SECOND_VIEWER_QUERY: TypedDocumentNode<ViewerQuery> = gql`
  query SecondViewer {
    viewer {
      id
    }
  }
`;

const createJwt = (expiresAtSeconds: number, subject: string) => {
  const payload = Buffer.from(JSON.stringify({ exp: expiresAtSeconds, sub: subject })).toString(
    "base64url",
  );
  return `header.${payload}.signature`;
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200,
  });

describe("Apollo GraphQL infrastructure", () => {
  afterEach(() => {
    setGraphQLSession(null);
    setGraphQLSessionHandlers({});
    secureStore.delayReads = false;
    secureStore.pendingReads = [];
    secureStore.writes = 0;
    nativeCrypto.randomUUID.mockClear();
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
    setGraphQLSession({ accessToken: "session-token", refreshToken: "refresh-token" });

    await apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    const request = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get("authorization")).toBe("Bearer session-token");
  });

  it("sends one persisted install id with every GraphQL request", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { viewer: { id: "viewer-1" } } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });
    await apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    const deviceIds = fetchMock.mock.calls.map((call) =>
      new Headers(call[1]?.headers).get("x-device-id"),
    );
    expect(deviceIds[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(deviceIds[1]).toBe(deviceIds[0]);
    expect(secureStore.values.get("chattea.installId")).toBe(deviceIds[0]);
  });

  it("shares one install id initialization across simultaneous first requests", async () => {
    vi.resetModules();
    secureStore.values.clear();
    secureStore.delayReads = true;
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { viewer: { id: "viewer-1" } } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { createApolloClient } = await import("../src/shared/graphql/client");
    const firstClient = createApolloClient();
    const secondClient = createApolloClient();

    const requests = [
      firstClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
      secondClient.query({ fetchPolicy: "no-cache", query: SECOND_VIEWER_QUERY }),
    ];
    await vi.waitFor(() => expect(secureStore.pendingReads.length).toBeGreaterThanOrEqual(1));
    await Promise.resolve();
    await Promise.resolve();
    secureStore.pendingReads.forEach((resolve) => resolve());
    await Promise.all(requests);

    const deviceIds = fetchMock.mock.calls.map((call) =>
      new Headers(call[1]?.headers).get("x-device-id"),
    );
    expect(deviceIds[0]).toBe(deviceIds[1]);
    expect(secureStore.writes).toBe(1);
  });

  it("creates an install id without a Web Crypto global", async () => {
    vi.resetModules();
    secureStore.values.clear();
    vi.stubGlobal("crypto", undefined);
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { viewer: { id: "viewer-1" } } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { createApolloClient } = await import("../src/shared/graphql/client");

    await createApolloClient().query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("x-device-id")).toBe(
      "37e62526-6f75-4fbc-9df8-10fabd98929b",
    );
    expect(nativeCrypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  it("replaces an invalid persisted install id", async () => {
    vi.resetModules();
    secureStore.values.set("chattea.installId", "legacy-device-id");
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { viewer: { id: "viewer-1" } } }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { createApolloClient } = await import("../src/shared/graphql/client");

    await createApolloClient().query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("x-device-id")).toBe(
      "37e62526-6f75-4fbc-9df8-10fabd98929b",
    );
    expect(secureStore.values.get("chattea.installId")).toBe(
      "37e62526-6f75-4fbc-9df8-10fabd98929b",
    );
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

    setGraphQLSession({ accessToken: "next-session-token", refreshToken: "refresh-token" });

    expect(apolloClient.cache.extract()).toEqual({});
  });

  it("drops an in-flight response from a superseded session before it reaches the cache", async () => {
    let resolveResponse!: (response: Response) => void;
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>(() => response);
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession({ accessToken: "old-access", refreshToken: "old-refresh" });

    const request = apolloClient.query({ fetchPolicy: "network-only", query: VIEWER_QUERY });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    setGraphQLSession({ accessToken: "new-access", refreshToken: "new-refresh" });
    resolveResponse(jsonResponse({ data: { viewer: { id: "old-viewer" } } }));

    await expect(request).rejects.toThrow("SESSION_CHANGED_DURING_REQUEST");
    expect(apolloClient.cache.extract()).toEqual({});
  });

  it("refreshes an expiring access token outside GraphQL variables before one request", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 30, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { query: string; variables?: unknown };
      if (body.query.includes("RefreshNativeSession")) {
        expect(body.variables).toBeUndefined();
        expect(String(init?.body)).not.toContain(current.refreshToken);
        expect(new Headers(init?.headers).get("authorization")).toBe(
          `Bearer ${current.refreshToken}`,
        );
        return jsonResponse({ data: { refresh: rotated } });
      }
      expect(new Headers(init?.headers).get("authorization")).toBe(`Bearer ${rotated.accessToken}`);
      return jsonResponse({ data: { viewer: { id: "viewer-1" } } });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession(current);

    await apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${rotated.accessToken}`,
    });
  });

  it("waits for durable rotated-token storage before publishing or sending the request", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    let releasePersistence!: () => void;
    const persistence = new Promise<void>((resolve) => {
      releasePersistence = resolve;
    });
    const events: string[] = [];
    let viewerRequests = 0;
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      if (String(init?.body).includes("RefreshNativeSession")) {
        return jsonResponse({ data: { refresh: rotated } });
      }
      viewerRequests += 1;
      events.push("request");
      return jsonResponse({ data: { viewer: { id: "viewer-1" } } });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSessionHandlers({
      onSessionPublished: () => events.push("publish"),
      onSessionRefreshed: async () => {
        events.push("persist:start");
        await persistence;
        events.push("persist:end");
      },
    });
    setGraphQLSession(current);

    const request = apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });
    await vi.waitFor(() => expect(events).toContain("persist:start"));

    expect(viewerRequests).toBe(0);
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${current.accessToken}`,
    });

    releasePersistence();
    await request;

    expect(events).toEqual(["persist:start", "persist:end", "publish", "request"]);
  });

  it("shares one refresh across simultaneous expiring-token requests", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    let resolveRefresh!: (response: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      const body = String(init?.body);
      if (body.includes("RefreshNativeSession")) return refreshResponse;
      return jsonResponse({ data: { viewer: { id: "viewer-1" } } });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession(current);

    const requests = [
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
      apolloClient.query({ fetchPolicy: "no-cache", query: SECOND_VIEWER_QUERY }),
    ];
    await vi.waitFor(() =>
      expect(
        fetchMock.mock.calls.filter((call) =>
          String(call[1]?.body).includes("RefreshNativeSession"),
        ),
      ).toHaveLength(1),
    );
    resolveRefresh(jsonResponse({ data: { refresh: rotated } }));
    await Promise.all(requests);

    expect(
      fetchMock.mock.calls.filter((call) => String(call[1]?.body).includes("RefreshNativeSession")),
    ).toHaveLength(1);
  });

  it("refreshes once and retries once after an UNAUTHENTICATED response", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 900, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    let viewerRequests = 0;
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      if (String(init?.body).includes("RefreshNativeSession")) {
        return jsonResponse({ data: { refresh: rotated } });
      }
      viewerRequests += 1;
      return viewerRequests === 1
        ? jsonResponse({
            errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "Unauthenticated" }],
          })
        : jsonResponse({ data: { viewer: { id: "viewer-1" } } });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession(current);

    await expect(
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
    ).resolves.toMatchObject({ data: { viewer: { id: "viewer-1" } } });

    expect(viewerRequests).toBe(2);
    expect(
      fetchMock.mock.calls.filter((call) => String(call[1]?.body).includes("RefreshNativeSession")),
    ).toHaveLength(1);
  });

  it("terminates once when refresh fails without retrying indefinitely", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const onTerminationRequired = vi.fn();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "Unauthenticated" }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSessionHandlers({ onTerminationRequired });
    setGraphQLSession({
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    });

    await expect(
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
    ).rejects.toThrow("SESSION_REFRESH_FAILED");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onTerminationRequired).toHaveBeenCalledTimes(1);
  });

  it("keeps a refreshable session when token rotation is only temporarily offline", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const onTerminationRequired = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.reject(new TypeError("Network request failed"))),
    );
    setGraphQLSessionHandlers({ onTerminationRequired });
    setGraphQLSession(current);

    await expect(
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
    ).rejects.toThrow("SESSION_REFRESH_UNAVAILABLE");

    expect(onTerminationRequired).not.toHaveBeenCalled();
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${current.accessToken}`,
    });
  });

  it("does not refresh twice when a freshly rotated access token is rejected", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    const onTerminationRequired = vi.fn();
    let refreshRequests = 0;
    let viewerRequests = 0;
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      if (String(init?.body).includes("RefreshNativeSession")) {
        refreshRequests += 1;
        return jsonResponse({ data: { refresh: rotated } });
      }
      viewerRequests += 1;
      return jsonResponse({
        errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "Unauthenticated" }],
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSessionHandlers({ onTerminationRequired });
    setGraphQLSession({
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    });

    await expect(
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
    ).rejects.toThrow("Unauthenticated");

    expect(refreshRequests).toBe(1);
    expect(viewerRequests).toBe(1);
    expect(onTerminationRequired).toHaveBeenCalledTimes(1);
  });

  it("ignores a completed refresh from an older session generation", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const oldSession = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const newSession = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    const staleRotation = {
      accessToken: createJwt(nowSeconds + 900, "stale-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "stale-refresh"),
    };
    let resolveRefresh!: (response: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });
    const onTerminationRequired = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => refreshResponse),
    );
    setGraphQLSessionHandlers({ onTerminationRequired });
    setGraphQLSession(oldSession);

    const request = apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });
    await Promise.resolve();
    setGraphQLSession(newSession);
    resolveRefresh(jsonResponse({ data: { refresh: staleRotation } }));

    await expect(request).rejects.toThrow("SESSION_CHANGED_DURING_REFRESH");
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${newSession.accessToken}`,
    });
    expect(onTerminationRequired).not.toHaveBeenCalled();
  });

  it("does not publish an old rotation when identity changes during durable storage", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const oldSession = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const newSession = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    const staleRotation = {
      accessToken: createJwt(nowSeconds + 900, "stale-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "stale-refresh"),
    };
    let releasePersistence!: () => void;
    const persistence = new Promise<void>((resolve) => {
      releasePersistence = resolve;
    });
    const onSessionPublished = vi.fn();
    const onSessionRefreshed = vi.fn(() => persistence);
    const onTerminationRequired = vi.fn();
    setGraphQLSessionHandlers({
      onSessionPublished,
      onSessionRefreshed,
      onTerminationRequired,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => jsonResponse({ data: { refresh: staleRotation } })),
    );
    setGraphQLSession(oldSession);

    const request = apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY });
    await vi.waitFor(() => expect(onSessionRefreshed).toHaveBeenCalledTimes(1));
    setGraphQLSession(newSession);
    releasePersistence();

    await expect(request).rejects.toThrow("SESSION_CHANGED_DURING_REFRESH");
    expect(onSessionPublished).not.toHaveBeenCalled();
    expect(onTerminationRequired).not.toHaveBeenCalled();
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${newSession.accessToken}`,
    });
  });

  it("terminates safely when durable rotated-token storage fails", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current = {
      accessToken: createJwt(nowSeconds + 10, "old-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "old-refresh"),
    };
    const rotated = {
      accessToken: createJwt(nowSeconds + 900, "new-access"),
      refreshToken: createJwt(nowSeconds + 3_600, "new-refresh"),
    };
    const onSessionPublished = vi.fn();
    const onTerminationRequired = vi.fn();
    setGraphQLSessionHandlers({
      onSessionPublished,
      onSessionRefreshed: () => Promise.reject(new Error("secure store unavailable")),
      onTerminationRequired,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => jsonResponse({ data: { refresh: rotated } })),
    );
    setGraphQLSession(current);

    await expect(
      apolloClient.query({ fetchPolicy: "no-cache", query: VIEWER_QUERY }),
    ).rejects.toThrow("SESSION_REFRESH_FAILED");

    expect(onSessionPublished).not.toHaveBeenCalled();
    expect(onTerminationRequired).toHaveBeenCalledTimes(1);
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: `Bearer ${current.accessToken}`,
    });
  });

  it("revokes the current native refresh token through the raw logout path", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const session = {
      accessToken: createJwt(nowSeconds + 900, "access"),
      refreshToken: createJwt(nowSeconds + 3_600, "refresh"),
    };
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      expect(new Headers(init?.headers).get("authorization")).toBe(
        `Bearer ${session.refreshToken}`,
      );
      const body = JSON.parse(String(init?.body)) as { query: string; variables?: unknown };
      expect(body.query).toContain("LogoutNativeSession");
      expect(body.variables).toBeUndefined();
      expect(String(init?.body)).not.toContain(session.refreshToken);
      return jsonResponse({ data: { logout: true } });
    });
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession(session);

    await expect(revokeGraphQLSession()).resolves.toBe(true);
  });

  it("fails explicit logout closed when the backend does not confirm revocation", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => jsonResponse({ data: { logout: false } })),
    );
    setGraphQLSession({
      accessToken: createJwt(nowSeconds + 900, "access"),
      refreshToken: createJwt(nowSeconds + 3_600, "refresh"),
    });

    await expect(revokeGraphQLSession()).rejects.toThrow("SESSION_LOGOUT_FAILED");
  });
});
