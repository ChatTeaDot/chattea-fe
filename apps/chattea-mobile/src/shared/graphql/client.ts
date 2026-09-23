import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { toByteArray } from "base64-js";

import { endpoint } from "./constants";
import { getInstallId } from "./utils";

export type GraphQLSession = {
  accessToken: string;
  refreshToken: string;
};

let graphQLSession: GraphQLSession | null = null;
let sessionGeneration = 0;
let terminationGeneration: number | null = null;
let sessionHandlers: GraphQLSessionHandlers = {};
let refreshTask: { generation: number; promise: Promise<boolean> } | null = null;

type GraphQLSessionHandlers = {
  onSessionPublished?: (session: GraphQLSession) => void;
  onSessionRefreshed?: (session: GraphQLSession) => Promise<void>;
  onTerminationRequired?: () => void;
};

class SessionRequestUnavailableError extends Error {}

const REFRESH_SESSION_MUTATION = `
  mutation RefreshNativeSession {
    refresh {
      accessToken
      refreshToken
    }
  }
`;

const LOGOUT_SESSION_MUTATION = `
  mutation LogoutNativeSession {
    logout
  }
`;

const accessTokenExpiresAt = (token: string): number | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = Array.from(toByteArray(padded), (value) => String.fromCharCode(value)).join("");
    const match = /"exp"\s*:\s*(\d+)/.exec(decoded);
    return match?.[1] ? Number(match[1]) * 1_000 : null;
  } catch {
    return null;
  }
};

const shouldRefreshAccessToken = (session: GraphQLSession): boolean => {
  const expiresAt = accessTokenExpiresAt(session.accessToken);
  return expiresAt !== null && expiresAt <= Date.now() + 60_000;
};

const isCurrentSession = (session: GraphQLSession, generation: number): boolean =>
  generation === sessionGeneration && graphQLSession?.refreshToken === session.refreshToken;

const requestSessionTermination = () => {
  if (!graphQLSession || terminationGeneration === sessionGeneration) return;
  terminationGeneration = sessionGeneration;
  sessionHandlers.onTerminationRequired?.();
};

const rawSessionRequest = async (query: string, refreshToken: string): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      body: JSON.stringify({ query }),
      credentials: "include",
      headers: {
        authorization: `Bearer ${refreshToken}`,
        "content-type": "application/json",
        "x-device-id": await getInstallId(),
      },
      method: "POST",
    });
  } catch {
    throw new SessionRequestUnavailableError("SESSION_REQUEST_UNAVAILABLE");
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("SESSION_REQUEST_REJECTED");
    }
    throw new SessionRequestUnavailableError("SESSION_REQUEST_UNAVAILABLE");
  }
  try {
    return await response.json();
  } catch {
    throw new SessionRequestUnavailableError("SESSION_REQUEST_UNAVAILABLE");
  }
};

const readRefreshedSession = (result: unknown): GraphQLSession => {
  if (!result || typeof result !== "object") throw new Error("SESSION_REFRESH_FAILED");
  const data = Reflect.get(result, "data");
  const refresh = data && typeof data === "object" ? Reflect.get(data, "refresh") : null;
  const accessToken =
    refresh && typeof refresh === "object" ? Reflect.get(refresh, "accessToken") : null;
  const refreshToken =
    refresh && typeof refresh === "object" ? Reflect.get(refresh, "refreshToken") : null;
  if (
    typeof accessToken !== "string" ||
    typeof refreshToken !== "string" ||
    accessToken.split(".").length !== 3 ||
    refreshToken.split(".").length !== 3
  ) {
    throw new Error("SESSION_REFRESH_FAILED");
  }
  return { accessToken, refreshToken };
};

const refreshCurrentSession = (force: boolean): Promise<boolean> => {
  const current = graphQLSession;
  const requestGeneration = sessionGeneration;
  if (!current || !current.refreshToken) {
    return force ? Promise.reject(new Error("SESSION_REFRESH_FAILED")) : Promise.resolve(false);
  }
  if (!force && !shouldRefreshAccessToken(current)) return Promise.resolve(false);
  if (refreshTask?.generation === requestGeneration) return refreshTask.promise;

  const promise = (async () => {
    try {
      const result = await rawSessionRequest(REFRESH_SESSION_MUTATION, current.refreshToken);
      if (!isCurrentSession(current, requestGeneration)) {
        throw new Error("SESSION_CHANGED_DURING_REFRESH");
      }
      const nextSession = readRefreshedSession(result);
      await sessionHandlers.onSessionRefreshed?.(nextSession);
      if (!isCurrentSession(current, requestGeneration)) {
        throw new Error("SESSION_CHANGED_DURING_REFRESH");
      }
      setGraphQLSession(nextSession);
      sessionHandlers.onSessionPublished?.(nextSession);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "SESSION_CHANGED_DURING_REFRESH") throw error;
      if (error instanceof SessionRequestUnavailableError) {
        throw new Error("SESSION_REFRESH_UNAVAILABLE");
      }
      if (isCurrentSession(current, requestGeneration)) requestSessionTermination();
      throw new Error("SESSION_REFRESH_FAILED");
    }
  })();
  const task = { generation: requestGeneration, promise };
  refreshTask = task;
  void promise
    .finally(() => {
      if (refreshTask === task) refreshTask = null;
    })
    .catch(() => undefined);
  return promise;
};

const hasUnauthenticatedError = (result: ApolloLink.Result): boolean =>
  Boolean(
    result.errors?.some(
      (error) =>
        error.extensions?.code === "UNAUTHENTICATED" ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Unauthenticated"),
    ),
  );

const createSessionLifecycleLink = () =>
  new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let active = true;
        let refreshedBeforeRequest = false;
        let refreshingAfterError = false;
        let retried = false;
        let subscription: ReturnType<ReturnType<typeof forward>["subscribe"]> | null = null;

        const fail = (error: unknown) => {
          if (active) observer.error(error);
        };
        const subscribe = () => {
          if (!active) return;
          const requestGeneration = sessionGeneration;
          const failIfSessionChanged = (): boolean => {
            if (requestGeneration === sessionGeneration) return false;
            subscription?.unsubscribe();
            fail(new Error("SESSION_CHANGED_DURING_REQUEST"));
            return true;
          };
          subscription = forward(operation).subscribe({
            complete: () => {
              if (failIfSessionChanged()) return;
              if (!refreshingAfterError) observer.complete();
            },
            error: (error) => {
              if (!failIfSessionChanged()) fail(error);
            },
            next: (result) => {
              if (failIfSessionChanged()) return;
              if (!hasUnauthenticatedError(result)) {
                observer.next(result);
                return;
              }
              if (retried || refreshedBeforeRequest) {
                requestSessionTermination();
                observer.next(result);
                return;
              }
              retried = true;
              refreshingAfterError = true;
              subscription?.unsubscribe();
              void refreshCurrentSession(true)
                .then(() => {
                  refreshingAfterError = false;
                  subscribe();
                })
                .catch(fail);
            },
          });
        };

        void refreshCurrentSession(false)
          .then((refreshed) => {
            refreshedBeforeRequest = refreshed;
            subscribe();
          })
          .catch(fail);
        return () => {
          active = false;
          subscription?.unsubscribe();
        };
      }),
  );

export const getGraphQLAuthorizationHeaders = (): Record<string, string> =>
  graphQLSession ? { authorization: `Bearer ${graphQLSession.accessToken}` } : {};

export const refreshGraphQLSession = (): Promise<boolean> => refreshCurrentSession(true);

let requestSeq = 0;
const requestSession = Date.now().toString(36);

const createTransportLink = (): ApolloLink => {
  const httpLink = new HttpLink({ credentials: "include", uri: endpoint });
  const authLink = new SetContextLink(async ({ headers }) => {
    requestSeq += 1;
    const deviceId = await getInstallId();
    return {
      headers: {
        ...headers,
        ...getGraphQLAuthorizationHeaders(),
        "x-device-id": deviceId,
        "x-request-id": `${deviceId}-${requestSession}-${requestSeq}`,
      },
    };
  });

  return createSessionLifecycleLink().concat(authLink).concat(httpLink);
};

export const createApolloClient = (link: ApolloLink = createTransportLink()) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

export const apolloClient = createApolloClient();

export const setGraphQLSession = (session: GraphQLSession | null) => {
  if (
    graphQLSession?.accessToken !== session?.accessToken ||
    graphQLSession?.refreshToken !== session?.refreshToken
  ) {
    sessionGeneration += 1;
    terminationGeneration = null;
    apolloClient.cache.restore({});
  }
  graphQLSession = session;
};

export const setGraphQLSessionHandlers = (handlers: GraphQLSessionHandlers) => {
  sessionHandlers = handlers;
};

export const revokeGraphQLSession = async (): Promise<boolean> => {
  const current = graphQLSession;
  if (!current?.refreshToken) return true;
  const result = await rawSessionRequest(LOGOUT_SESSION_MUTATION, current.refreshToken);
  if (!result || typeof result !== "object") throw new Error("SESSION_LOGOUT_FAILED");
  const data = Reflect.get(result, "data");
  if (!data || typeof data !== "object" || Reflect.get(data, "logout") !== true) {
    throw new Error("SESSION_LOGOUT_FAILED");
  }
  return true;
};
