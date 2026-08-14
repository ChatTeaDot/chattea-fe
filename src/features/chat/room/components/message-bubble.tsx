import { memo, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { Message } from "../../types";

type MessageBubbleProps = {
  message: Message;
  onReport: () => void;
};

export const MessageBubble = memo(({ message, onReport }: MessageBubbleProps) => {
  const fade = useRef(new Animated.Value(1)).current;
  const previousTextRef = useRef("");
  const [segments, setSegments] = useState({ base: "", suffix: message.text });
  const suffixStyle = { opacity: fade };

  useEffect(() => {
    const previousText = previousTextRef.current;
    const base = message.text.startsWith(previousText) ? previousText : "";
    const suffix = base ? message.text.slice(base.length) : message.text;

    setSegments({ base, suffix });
    previousTextRef.current = message.text;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (reduced) {
          fade.setValue(1);
          return;
        }
        fade.setValue(0);
        Animated.timing(fade, {
          duration: 180,
          toValue: 1,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => fade.setValue(1));
  }, [fade, message.text]);

  return (
    <View style={[styles.bubble, message.mine && styles.mine]}>
      <Text style={styles.text}>
        {segments.base}
        <Animated.Text style={suffixStyle}>{segments.suffix}</Animated.Text>
      </Text>
      <Text style={styles.status}>{formatStatus(message.status)}</Text>
      <Pressable
        accessibilityLabel="메시지 신고"
        accessibilityRole="button"
        onPress={onReport}
        style={styles.reportButton}
      >
        <Text style={styles.report}>신고</Text>
      </Pressable>
    </View>
  );
});

MessageBubble.displayName = "MessageBubble";

const formatStatus = (status: Message["status"]) => {
  if (status === "failed") {
    return "전송 실패";
  }

  if (status === "sending") {
    return "전송 중";
  }

  return "보냄";
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    maxWidth: "82%",
    padding: theme.spacing.md,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.text,
  },
  status: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  reportButton: { justifyContent: "center", minHeight: 44 },
  report: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: theme.spacing.xs,
  },
}));
