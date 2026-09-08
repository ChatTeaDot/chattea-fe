import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { LogoutCardProps } from "../types";
const LogoutCard = ({ logoutPending, logOut }: LogoutCardProps) => {
  return (
    <NativeCard>
      <Text style={styles.postTitle}>로그아웃</Text>
      <MetaText>이 기기에서만 로그아웃해요.</MetaText>
      <NativeButton
        disabled={logoutPending}
        label="로그아웃"
        onPress={() => void logOut()}
        tone="secondary"
        fullWidth
      />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
}));
export default LogoutCard;
