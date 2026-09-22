import { router } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native-unistyles";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { getGraphQLAuthorizationHeaders } from "@/shared/graphql";

import { communityWebUrl } from "../constants";
import { useCommunityWebviewTrace } from "../hooks";
import { parseNavigateMessage } from "../utils";

const CommunityWebview = () => {
  const trace = useCommunityWebviewTrace();

  // ponytail: token snapshot at load; expiry hits the web error state.
  // upgrade path: postMessage refresh bridge back to native.
  const injectedAuth = useMemo(
    () => `window.__CHATTEA_AUTH__=${JSON.stringify(getGraphQLAuthorizationHeaders())};true;`,
    [],
  );

  useEffect(() => {
    trace.onMount();
  }, [trace]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = event.nativeEvent.data;
      const path = parseNavigateMessage(data);
      if (path) {
        router.push(path);
        return;
      }
      trace.onMessage(data);
    },
    [trace],
  );

  return (
    <WebView
      injectedJavaScriptBeforeContentLoaded={injectedAuth}
      onLoadEnd={trace.onLoadEnd}
      onLoadStart={trace.onLoadStart}
      onMessage={handleMessage}
      source={{ uri: communityWebUrl }}
      style={styles.webview}
    />
  );
};

const styles = StyleSheet.create(() => ({
  webview: {
    flex: 1,
  },
}));

export default CommunityWebview;
