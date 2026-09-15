import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { AccountDeletionCardProps } from "../types";
const AccountDeletionCard = ({ state, logoutPending, deleteAccount }: AccountDeletionCardProps) => {
  return (
    <NativeCard>
      <Text style={styles.postTitle}>회원 탈퇴</Text>
      <MetaText>
        탈퇴 후 14일 동안 계정을 복구할 수 있어요. 기간이 지나면 개인정보는 삭제되고 공유한 글은
        익명으로 남아요.
      </MetaText>
      <NativeButton
        disabled={state.loading || logoutPending}
        label="회원 탈퇴"
        onPress={deleteAccount}
        tone="danger"
        fullWidth
      />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
}));
export default AccountDeletionCard;
