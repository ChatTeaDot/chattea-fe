import {
  COMMUNITY_AUTH_FAILED_EVENT,
  COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE,
  COMMUNITY_AUTH_REFRESHED_EVENT,
  communityWebUrl,
} from "../constants";

export const isAuthRefreshMessage = (raw: string): boolean => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return false;
    return (parsed as Record<string, unknown>).type === COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE;
  } catch {
    return false;
  }
};

export const isCommunityWebviewUrl = (url: string): boolean => {
  try {
    return new URL(url).origin === new URL(communityWebUrl).origin;
  } catch {
    return false;
  }
};

export const createAuthRefreshedInjection = (headers: Record<string, string>): string =>
  `window.__CHATTEA_AUTH__=${JSON.stringify(headers)};window.dispatchEvent(new Event(${JSON.stringify(COMMUNITY_AUTH_REFRESHED_EVENT)}));true;`;

export const AUTH_FAILED_INJECTION = `window.dispatchEvent(new Event(${JSON.stringify(COMMUNITY_AUTH_FAILED_EVENT)}));true;`;

type AuthRefreshHandlerDeps = {
  getAuthHeaders: () => Record<string, string>;
  inject: (script: string) => void;
  refreshSession: () => Promise<unknown>;
};

export const createAuthRefreshHandler =
  ({ getAuthHeaders, inject, refreshSession }: AuthRefreshHandlerDeps) =>
  (raw: string, url: string): boolean => {
    if (!isAuthRefreshMessage(raw)) return false;
    if (isCommunityWebviewUrl(url)) {
      void refreshSession()
        .then(() => inject(createAuthRefreshedInjection(getAuthHeaders())))
        .catch(() => inject(AUTH_FAILED_INJECTION));
    }
    return true;
  };
