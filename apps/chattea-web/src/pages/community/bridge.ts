import {
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
