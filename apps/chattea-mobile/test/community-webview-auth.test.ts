import { afterEach, describe, expect, it, vi } from "vitest";

import {
  COMMUNITY_AUTH_FAILED_EVENT,
  COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE,
  COMMUNITY_AUTH_REFRESHED_EVENT,
  communityWebUrl,
} from "../src/features/community/constants";
import {
  createAuthRefreshHandler,
  isAuthRefreshMessage,
  isCommunityWebviewUrl,
} from "../src/features/community/utils/webview-auth";
import { refreshGraphQLSession, setGraphQLSession } from "../src/shared/graphql";

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => undefined),
}));
vi.mock("expo-crypto", () => ({
  randomUUID: () => "9d4d6a3e-7f57-4fb8-9275-ae94878316eb",
}));

const refreshMessage = JSON.stringify({ type: COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE });
const pageUrl = `${new URL(communityWebUrl).origin}/community`;

const createHandler = (refreshSession: () => Promise<unknown>) => {
  const inject = vi.fn();
  const handler = createAuthRefreshHandler({
    getAuthHeaders: () => ({ authorization: "Bearer fresh" }),
    inject,
    refreshSession,
  });
  return { handler, inject };
};

describe("webview auth bridge", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setGraphQLSession(null);
  });

  it("recognizes only the auth refresh message type", () => {
    expect(isAuthRefreshMessage(refreshMessage)).toBe(true);
    expect(isAuthRefreshMessage(JSON.stringify({ type: "chattea.community.navigate" }))).toBe(false);
    expect(isAuthRefreshMessage("not-json")).toBe(false);
  });

  it("accepts only the community webview origin", () => {
    expect(isCommunityWebviewUrl(pageUrl)).toBe(true);
    expect(isCommunityWebviewUrl(communityWebUrl)).toBe(true);
    expect(isCommunityWebviewUrl("https://evil.example/community")).toBe(false);
    expect(isCommunityWebviewUrl("not-a-url")).toBe(false);
    expect(isCommunityWebviewUrl("")).toBe(false);
  });

  it("injects fresh auth and the retry signal after refresh", async () => {
    const refreshSession = vi.fn(async () => true);
    const { handler, inject } = createHandler(refreshSession);

    expect(handler(refreshMessage, pageUrl)).toBe(true);
    await vi.waitFor(() => expect(inject).toHaveBeenCalledTimes(1));

    const script = inject.mock.calls[0]?.[0] as string;
    expect(script).toContain('window.__CHATTEA_AUTH__={"authorization":"Bearer fresh"}');
    expect(script).toContain(COMMUNITY_AUTH_REFRESHED_EVENT);
  });

  it("ignores refresh messages from a foreign origin", async () => {
    const refreshSession = vi.fn(async () => true);
    const { handler, inject } = createHandler(refreshSession);

    expect(handler(refreshMessage, "https://evil.example/community")).toBe(true);
    await Promise.resolve();

    expect(refreshSession).not.toHaveBeenCalled();
    expect(inject).not.toHaveBeenCalled();
  });

  it("injects the failure signal when refresh rejects", async () => {
    const refreshSession = vi.fn(async () => {
      throw new Error("SESSION_REFRESH_FAILED");
    });
    const { handler, inject } = createHandler(refreshSession);

    handler(refreshMessage, pageUrl);
    await vi.waitFor(() => expect(inject).toHaveBeenCalledTimes(1));

    const script = inject.mock.calls[0]?.[0] as string;
    expect(script).toContain(COMMUNITY_AUTH_FAILED_EVENT);
    expect(script).not.toContain("__CHATTEA_AUTH__=");
  });

  it("passes non-auth messages through", () => {
    const refreshSession = vi.fn(async () => true);
    const { handler } = createHandler(refreshSession);

    expect(handler(JSON.stringify({ type: "chattea.community.navigate" }), pageUrl)).toBe(false);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("shares one refresh across concurrent session requests", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: { refresh: { accessToken: "a.b.c", refreshToken: "d.e.f" } },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    setGraphQLSession({ accessToken: "old.old.old", refreshToken: "r.r.r" });

    await Promise.all([refreshGraphQLSession(), refreshGraphQLSession()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
