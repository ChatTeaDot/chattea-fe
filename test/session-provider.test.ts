import { createRequire } from "node:module";

import * as SecureStore from "expo-secure-store";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeSessionHydration,
  publishSession,
  SessionProvider,
  useSession,
} from "../src/providers/session-provider";
import { getGraphQLAuthorizationHeaders, setGraphQLSession } from "../src/shared/graphql/client";

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

vi.mock("expo-crypto", () => ({ randomUUID: () => "37e62526-6f75-4fbc-9df8-10fabd98929b" }));
vi.mock("expo-secure-store", () => ({
  deleteItemAsync: vi.fn(() => Promise.resolve()),
  getItemAsync: vi.fn(() => Promise.resolve(null)),
  setItemAsync: vi.fn(() => Promise.resolve()),
}));

const session = {
  accessToken: "access.payload.signature",
  refreshToken: "refresh.payload.signature",
};

describe("session publication", () => {
  beforeEach(() => {
    vi.mocked(SecureStore.deleteItemAsync).mockReset().mockResolvedValue();
    vi.mocked(SecureStore.getItemAsync).mockReset().mockResolvedValue(null);
    vi.mocked(SecureStore.setItemAsync).mockReset().mockResolvedValue();
  });

  afterEach(() => setGraphQLSession(null));

  it("publishes GraphQL authentication before the React session update", () => {
    const updateReactSession = vi.fn(() => {
      expect(getGraphQLAuthorizationHeaders()).toEqual({
        authorization: "Bearer access.payload.signature",
      });
    });

    publishSession(session, updateReactSession);

    expect(updateReactSession).toHaveBeenCalledWith(session);
  });

  it("publishes a hydrated session before exposing hydration to child renders", () => {
    const order: string[] = [];

    completeSessionHydration(
      session,
      () => {
        expect(getGraphQLAuthorizationHeaders()).toEqual({
          authorization: "Bearer access.payload.signature",
        });
        order.push("session");
      },
      () => order.push("hydrated"),
    );

    expect(order).toEqual(["session", "hydrated"]);
  });

  it("durably stores a new login before publishing it to GraphQL consumers", async () => {
    let releasePersistence!: () => void;
    const persistence = new Promise<void>((resolve) => {
      releasePersistence = resolve;
    });
    vi.mocked(SecureStore.setItemAsync).mockReturnValueOnce(persistence);
    let commitSession: ((nextSession: typeof session) => unknown) | undefined;
    const CaptureSession = () => {
      commitSession = useSession().setSession;
      return null;
    };
    renderToStaticMarkup(createElement(SessionProvider, null, createElement(CaptureSession)));

    const commit = commitSession?.(session);

    expect(commit).toBeInstanceOf(Promise);
    expect(getGraphQLAuthorizationHeaders()).toEqual({});
    releasePersistence();
    await commit;
    expect(getGraphQLAuthorizationHeaders()).toEqual({
      authorization: "Bearer access.payload.signature",
    });
  });
});
