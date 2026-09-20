import { Heart, Undo2, X } from "lucide-react-native";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import type { MatchActionBarProps } from "../types";
import RoundActionButton from "./round-action-button";

const MatchActionBar = ({ disabled, onLike, onSkip, onUndo }: MatchActionBarProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.row}>
      <RoundActionButton
        disabled={disabled}
        icon={<X color={theme.colors.muted} size={24} strokeWidth={2} />}
        label="이번엔 넘기기"
        onPress={onSkip}
      />
      <RoundActionButton
        disabled={disabled}
        icon={<Heart color={theme.colors.primaryText} fill={theme.colors.primaryText} size={28} />}
        label="관심 보내기"
        main
        onPress={onLike}
      />
      <RoundActionButton
        disabled={disabled}
        icon={<Undo2 color={theme.colors.muted} size={24} strokeWidth={2} />}
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
