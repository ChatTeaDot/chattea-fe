import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native-unistyles";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { communityWebUrl } from "../constants";
import { useCommunityWebviewTrace } from "../hooks";

const CommunityWebview = () => {
  const trace = useCommunityWebviewTrace();

  useEffect(() => {
    trace.onMount();
  }, [trace]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      trace.onMessage(event.nativeEvent.data);
    },
    [trace],
  );

  return (
    <WebView
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
