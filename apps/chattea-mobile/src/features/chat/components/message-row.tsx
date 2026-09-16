import { CheckCheck } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { formatRelativeDate } from "@/shared/lib";

import type { MessageRowProps } from "../types";

const MessageRow = ({ createdAt, id, mine, onReport, showReadStatus, text }: MessageRowProps) => {
  const { theme } = useUnistyles();
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <View style={mine ? styles.messageMine : styles.messageOther}>
      <View style={mine ? styles.bubbleMine : styles.bubbleOther}>
        <Text style={mine ? styles.bubbleMineText : styles.bubbleOtherText}>{text}</Text>
      </View>
      {mine && showReadStatus ? (
        <View style={styles.messageMeta}>
          <Text style={styles.metaText}>읽음</Text>
          <CheckCheck color={theme.colors.muted} size={16} strokeWidth={1.5} />
        </View>
      ) : null}
      {!mine ? (
        <View style={styles.messageMeta}>
          <Text style={styles.metaText}>{formatRelativeDate(createdAt)}</Text>
          <Pressable
            accessibilityLabel="메시지 신고"
            accessibilityRole="button"
            hitSlop={8}
            onPress={report}
          >
            <Text style={styles.metaAction}>신고</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  messageMine: { alignItems: "flex-end", gap: theme.spacing.xs },
  messageOther: { alignItems: "flex-start", gap: theme.spacing.xs },
  bubbleMine: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.xxl,
    maxWidth: "76%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.control,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xxl,
    maxWidth: "76%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.control,
  },
  bubbleMineText: { color: theme.colors.accentText, fontSize: 15, lineHeight: 22 },
  bubbleOtherText: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  messageMeta: { alignItems: "center", flexDirection: "row", gap: theme.spacing.xs },
  metaText: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  metaAction: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
}));

export default MessageRow;
