import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useRevenueCat } from "@/features/billing";
import { usePushNotifications } from "@/features/notifications";
import { useSession } from "@/providers/session-provider";
import { performInstallationLogout } from "@/providers/utils/session-actions";
import { apolloClient, revokeGraphQLSession } from "@/shared/graphql";
import { formatDate, showActionError } from "@/shared/lib";

import { REQUEST_ACCOUNT_DELETION_MUTATION } from "./api";

export const useSettings = () => {
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
    } catch {
      showActionError();
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
                if (cleanupError) showActionError();
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

  return { pushNotifications, logoutPending, logOut, deleteAccount, state };
};
