import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MatchActionBarProps } from "../types";
import RoundActionButton from "./round-action-button";

const MatchActionBar = ({ disabled, onLike, onSkip, onUndo }: MatchActionBarProps) => {
  return (
    <View style={styles.row}>
      <RoundActionButton
        disabled={disabled}
        icon="sf:xmark"
        label="이번엔 넘기기"
        onPress={onSkip}
      />
      <RoundActionButton
        disabled={disabled}
        icon="sf:heart.fill"
        label="관심 보내기"
        main
        onPress={onLike}
      />
      <RoundActionButton
        disabled={disabled}
        icon="sf:arrow.uturn.backward"
        label="되돌리기"
        onPress={onUndo}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
}));

export default MatchActionBar;
