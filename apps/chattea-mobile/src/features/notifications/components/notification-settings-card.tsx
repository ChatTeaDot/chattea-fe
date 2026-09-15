import { router } from "expo-router";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { NotificationSettingsCardProps } from "../types";
const NotificationSettingsCard = ({ pushNotifications }: NotificationSettingsCardProps) => {
  return (
    <NativeCard>
      <Text style={styles.postTitle}>알림 설정</Text>
      <MetaText>좋아요, 매치, 메시지, 댓글, 결제 소식을 앱 알림으로 받을 수 있어요.</MetaText>
      <MetaText>
        {pushNotifications.state.status === "ready"
          ? "이 기기의 원격 알림이 연결되어 있어요."
          : pushNotifications.state.status === "loading"
            ? "원격 알림을 연결하고 있어요."
            : "message" in pushNotifications.state
              ? pushNotifications.state.message
              : "원격 알림 상태를 확인하고 있어요."}
      </MetaText>
      <NativeButton
        label="알림 확인하기"
        onPress={() => router.push("/notifications")}
        tone="secondary"
        fullWidth
      />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
}));
export default NotificationSettingsCard;
