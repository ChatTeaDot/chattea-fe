import { NotificationSettingsCard } from "@/features/notifications";
import { AccountDeletionCard, LogoutCard, useSettings } from "@/features/settings";
import { NativeScreen, NativeScroll } from "@/shared/components";

const SettingsScreen = () => {
  const { pushNotifications, logoutPending, logOut, deleteAccount, state } = useSettings();
  return (
    <NativeScreen>
      <NativeScroll>
        <NotificationSettingsCard pushNotifications={pushNotifications} />
        <LogoutCard logoutPending={logoutPending} logOut={logOut} />
        <AccountDeletionCard
          state={state}
          logoutPending={logoutPending}
          deleteAccount={deleteAccount}
        />
      </NativeScroll>
    </NativeScreen>
  );
};

export default SettingsScreen;
