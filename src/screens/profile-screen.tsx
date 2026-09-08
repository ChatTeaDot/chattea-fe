import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { CreditBalanceCard } from "@/features/billing";
import { ProfileSummaryCard, useProfile } from "@/features/profile";
import {
  ErrorState,
  LoadingState,
  NativeButton,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "@/shared/components";

const ProfileScreen = () => {
  const { me, balance } = useProfile();
  if (me.loading)
    return (
      <NativeScreen>
        <NativeScroll>
          <LoadingState />
        </NativeScroll>
      </NativeScreen>
    );
  if (!me.data?.me)
    return (
      <NativeScreen>
        <NativeScroll>
          <ErrorState />
        </NativeScroll>
      </NativeScreen>
    );
  const user = me.data.me;
  return (
    <NativeScreen>
      <NativeScroll>
        <ProfileSummaryCard user={user} />
        <SectionHeading title="내 이용권" />
        <CreditBalanceCard balance={balance} onViewPlans={() => router.push("/premium")} />
        <View style={styles.stackTight}>
          <NativeButton
            label="알림"
            onPress={() => router.push("/notifications")}
            tone="secondary"
            fullWidth
          />
          <NativeButton
            label="설정"
            onPress={() => router.push("/settings")}
            tone="secondary"
            fullWidth
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({ stackTight: { gap: theme.spacing.sm } }));

export default ProfileScreen;
