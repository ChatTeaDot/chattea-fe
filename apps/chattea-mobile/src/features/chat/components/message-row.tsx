import { useCallback } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton } from "@/shared/components";
import { formatRelativeDate } from "@/shared/lib";

import type { MessageRowProps } from "../types";

const MessageRow = ({ createdAt, id, mine, onReport, text }: MessageRowProps) => {
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <View style={mine ? styles.messageMine : styles.messageOther}>
      <View style={mine ? styles.bubbleMine : styles.bubbleOther}>
        <Text style={mine ? styles.bubbleMineText : styles.bubbleOtherText}>{text}</Text>
      </View>
      <View style={styles.messageMeta}>
        <MetaText>{formatRelativeDate(createdAt)}</MetaText>
        {!mine ? <NativeButton label="신고" onPress={report} tone="quiet" /> : null}
      </View>
    </View>
  );
};
const styles = StyleSheet.create((theme) => ({
  messageMine: { alignItems: "flex-end", gap: theme.spacing.xs },
  messageOther: { alignItems: "flex-start", gap: theme.spacing.xs },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    maxWidth: "84%",
    padding: theme.spacing.md,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 18,
    maxWidth: "84%",
    padding: theme.spacing.md,
  },
  bubbleMineText: { color: theme.colors.primaryText, fontSize: 16, lineHeight: 22 },
  bubbleOtherText: { color: theme.colors.text, fontSize: 16, lineHeight: 22 },
  messageMeta: { alignItems: "center", flexDirection: "row", gap: theme.spacing.xs },
}));
export default MessageRow;
