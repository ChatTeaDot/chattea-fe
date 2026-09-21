import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { WebView } from "react-native-webview";

import { communityWebUrl, communityWebviewPrewarmEnabled } from "../constants";

const CommunityWebviewPrewarm = () => {
  if (!communityWebviewPrewarmEnabled) return null;

  return (
    <View pointerEvents="none" style={styles.hidden}>
      <WebView source={{ uri: communityWebUrl }} style={styles.webview} />
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  hidden: {
    height: 1,
    opacity: 0,
    position: "absolute",
    top: -10,
    width: 1,
  },
  webview: {
    flex: 1,
  },
}));

export default CommunityWebviewPrewarm;
