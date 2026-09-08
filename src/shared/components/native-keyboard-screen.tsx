import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeKeyboardScreen = ({ children }: PropsWithChildren) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS === "ios"}
      style={styles.screen}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
}));

export default NativeKeyboardScreen;
