import { Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { PHONE_CODE_LENGTH } from "../constants";
import type { CodeFieldProps } from "../types";

const CodeField = ({ autoFocus = true, onChange, value }: CodeFieldProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const activeIndex = Math.min(value.length, PHONE_CODE_LENGTH - 1);
  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel="인증번호 6자리"
        autoFocus={autoFocus}
        caretHidden
        keyboardType="number-pad"
        maxLength={PHONE_CODE_LENGTH}
        onChangeText={onChange}
        selectionColor={theme.colors.accent}
        style={styles.hiddenInput}
        value={value}
      />
      <View pointerEvents="none" style={styles.boxes}>
        {Array.from({ length: PHONE_CODE_LENGTH }, (_, index) => (
          <View
            key={index}
            style={[styles.box, index === activeIndex && value.length < PHONE_CODE_LENGTH && styles.boxActive]}
          >
            <Text style={styles.digit}>{value[index] ?? ""}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  wrap: {
    alignSelf: "stretch",
  },
  hiddenInput: {
    bottom: 0,
    left: 0,
    opacity: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  boxes: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  box: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.transparent,
    borderRadius: theme.radii.lg,
    borderWidth: 1.5,
    height: 52,
    justifyContent: "center",
    width: theme.sizes.tapMin,
  },
  boxActive: {
    borderColor: theme.colors.accent,
  },
  digit: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
}));

export default CodeField;
