import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeScreen = ({ children }: PropsWithChildren) => {
  return <View style={styles.screen}>{children}</View>;
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
}));

export default NativeScreen;
