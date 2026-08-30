import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";

import { useRevenueCat } from "@/features/native/billing";
import {
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
} from "@/features/native/components";
import { usePushNotifications } from "@/features/native/notifications";
import { REQUEST_ACCOUNT_DELETION_MUTATION } from "@/features/native/operations";
import { performInstallationLogout } from "@/features/native/session-actions";
import { useSession } from "@/providers/session-provider";
import { apolloClient, revokeGraphQLSession } from "@/shared/graphql";

import { formatDate, showActionError, styles } from "./screen-shared";

export const SettingsScreen = () => {
  const { setSession } = useSession();
  const pushNotifications = usePushNotifications();
  const revenueCat = useRevenueCat();
  const [logoutPending, setLogoutPending] = useState(false);
  const [requestDeletion, state] = useMutation<{
    requestAccountDeletion: { hidden: boolean; scheduledFor: string };
  }>(REQUEST_ACCOUNT_DELETION_MUTATION);
  const clearSession = () => setSession(null);
  const logOut = async () => {
    setLogoutPending(true);
    try {
      await performInstallationLogout({
        clearCache: async () => {
          await apolloClient.clearStore();
        },
        clearSession,
        logOutRevenueCat: revenueCat.logOut,
        revokeSession: revokeGraphQLSession,
        unregisterPush: pushNotifications.unregisterInstallation,
      });
      router.replace("/");
    } catch (error) {
      showActionError(error);
    } finally {
      setLogoutPending(false);
    }
  };
  const deleteAccount = () => {
    Alert.alert(
      "정말 탈퇴할까요?",
      "지금 바로 계정이 숨겨지고 로그아웃돼요. 14일 안에 다시 로그인하면 복구할 수 있어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => {
            void requestDeletion()
              .then(async (response) => {
                const scheduledFor = response.data?.requestAccountDeletion.scheduledFor;
                const cleanup = await Promise.allSettled([
                  pushNotifications.clearLocal(),
                  revenueCat.logOut(),
                ]);
                await clearSession();
                await apolloClient.clearStore();
                router.replace("/");
                const cleanupError = cleanup.find(
                  (result): result is PromiseRejectedResult => result.status === "rejected",
                );
                if (cleanupError) showActionError(cleanupError.reason);
                if (scheduledFor)
                  Alert.alert(
                    "탈퇴를 예약했어요",
                    `${formatDate(scheduledFor)}까지 다시 로그인하면 계정을 복구할 수 있어요.`,
                  );
              })
              .catch(showActionError);
          },
        },
      ],
    );
  };
  return (
    <NativeScreen>
      <NativeScroll>
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
      </NativeScroll>
    </NativeScreen>
  );
};
