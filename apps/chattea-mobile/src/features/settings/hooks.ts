import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useRevenueCat } from "@/features/billing";
import { usePushNotifications } from "@/features/notifications";
import i18n from "@/i18n";
import { performInstallationLogout, useSession } from "@/providers";
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
      i18n.t("delete.confirmTitle", { ns: "settings" }),
      i18n.t("delete.confirmBody", { ns: "settings" }),
      [
        { text: i18n.t("actions.cancel"), style: "cancel" },
        {
          text: i18n.t("delete.action", { ns: "settings" }),
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
                    i18n.t("delete.scheduledTitle", { ns: "settings" }),
                    i18n.t("delete.scheduledBody", {
                      ns: "settings",
                      date: formatDate(scheduledFor),
                    }),
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
