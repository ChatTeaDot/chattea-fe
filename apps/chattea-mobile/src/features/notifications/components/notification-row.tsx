import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeCard } from "@/shared/components";
import { formatRelativeDate } from "@/shared/lib";

import type { NotificationRowProps } from "../types";

const NotificationRow = ({
  body,
  createdAt,
  id,
  onVisit,
  readAt,
  route,
  title,
  type,
}: NotificationRowProps) => {
  const visit = useCallback(
    () => onVisit({ body, createdAt, id, readAt, route, title, type }),
    [body, createdAt, id, onVisit, readAt, route, title, type],
  );
  return (
    <Pressable accessibilityRole="link" onPress={visit} style={styles.pressableCard}>
      <NativeCard>
        <View style={styles.postMeta}>
          <MetaText>{readAt ? "확인함" : "새 알림"}</MetaText>
          <MetaText>{formatRelativeDate(createdAt)}</MetaText>
        </View>
        <Text style={styles.postTitle}>{title}</Text>
        <Text style={styles.postBody}>{body}</Text>
      </NativeCard>
    </Pressable>
  );
};
const styles = StyleSheet.create((theme) => ({
  pressableCard: { borderRadius: 20 },
  postMeta: { flexDirection: "row", justifyContent: "space-between" },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  postBody: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
}));
export default NotificationRow;
