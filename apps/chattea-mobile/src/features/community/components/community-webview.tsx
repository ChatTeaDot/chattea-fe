import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native-unistyles";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { getGraphQLAuthorizationHeaders, refreshGraphQLSession } from "@/shared/graphql";

import { communityWebUrl } from "../constants";
import { useCommunityWebviewTrace } from "../hooks";
import { createAuthRefreshHandler, parseNavigateMessage } from "../utils";

const CommunityWebview = () => {
  const trace = useCommunityWebviewTrace();
  const webviewRef = useRef<WebView | null>(null);

  const injectedAuth = useMemo(
    () => `window.__CHATTEA_AUTH__=${JSON.stringify(getGraphQLAuthorizationHeaders())};true;`,
    [],
  );

  const authRefreshHandlerRef = useRef<ReturnType<typeof createAuthRefreshHandler> | null>(null);

  useEffect(() => {
    trace.onMount();
  }, [trace]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = event.nativeEvent.data;
      authRefreshHandlerRef.current ??= createAuthRefreshHandler({
        getAuthHeaders: getGraphQLAuthorizationHeaders,
        inject: (script) => webviewRef.current?.injectJavaScript(script),
        refreshSession: refreshGraphQLSession,
      });
      if (authRefreshHandlerRef.current(data, event.nativeEvent.url)) return;
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
      ref={webviewRef}
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
