import {
  COMMUNITY_AUTH_FAILED_EVENT,
  COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE,
  COMMUNITY_AUTH_REFRESH_TIMEOUT_MS,
  COMMUNITY_AUTH_REFRESHED_EVENT,
  COMMUNITY_NAVIGATE_MESSAGE_TYPE,
  COMMUNITY_NEW_PATH,
  COMMUNITY_POST_PATH_PREFIX,
} from "@/shared/config/constants";

export const navigateToNative = (path: string) => {
  window.ReactNativeWebView?.postMessage(
    JSON.stringify({ type: COMMUNITY_NAVIGATE_MESSAGE_TYPE, path }),
  );
};

export const openPost = (postId: string) =>
  navigateToNative(`${COMMUNITY_POST_PATH_PREFIX}${postId}`);

export const openWrite = () => navigateToNative(COMMUNITY_NEW_PATH);

let pendingRefresh: Promise<boolean> | null = null;

export const requestAuthRefresh = (): Promise<boolean> => {
  if (pendingRefresh) return pendingRefresh;
  if (typeof window === "undefined" || !window.ReactNativeWebView) {
    return Promise.resolve(false);
  }

  pendingRefresh = new Promise<boolean>((resolve) => {
    const settle = (ok: boolean) => {
      window.removeEventListener(COMMUNITY_AUTH_REFRESHED_EVENT, onRefreshed);
      window.removeEventListener(COMMUNITY_AUTH_FAILED_EVENT, onFailed);
      clearTimeout(timer);
      pendingRefresh = null;
      resolve(ok);
    };
    const onRefreshed = () => settle(true);
    const onFailed = () => settle(false);
    const timer = setTimeout(() => settle(false), COMMUNITY_AUTH_REFRESH_TIMEOUT_MS);

    window.addEventListener(COMMUNITY_AUTH_REFRESHED_EVENT, onRefreshed);
    window.addEventListener(COMMUNITY_AUTH_FAILED_EVENT, onFailed);
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: COMMUNITY_AUTH_REFRESH_MESSAGE_TYPE }),
    );
  });
  return pendingRefresh;
};
