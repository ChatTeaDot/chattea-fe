import { memo, useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { Message } from "./types";

type MessageBubbleProps = {
  message: Message;
  onReport: () => void;
};

export const MessageBubble = memo(({ message, onReport }: MessageBubbleProps) => {
  const fade = useRef(new Animated.Value(1)).current;
  const previousTextRef = useRef("");
  const [segments, setSegments] = useState({ base: "", suffix: message.text });

  useEffect(() => {
    const previousText = previousTextRef.current;
    const base = message.text.startsWith(previousText) ? previousText : "";
    const suffix = base ? message.text.slice(base.length) : message.text;

    setSegments({ base, suffix });
    previousTextRef.current = message.text;
    fade.setValue(0);
    Animated.timing(fade, {
      duration: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fade, message.text]);

  return (
    <View style={[styles.bubble, message.mine && styles.mine]}>
      <Text style={styles.text}>
        {segments.base}
        <Animated.Text style={{ opacity: fade }}>{segments.suffix}</Animated.Text>
      </Text>
      <Text style={styles.status}>{formatStatus(message.status)}</Text>
      <Text onPress={onReport} style={styles.report}>
        신고
      </Text>
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

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: "82%",
    padding: spacing.md,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  report: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
});
