import { router } from "expo-router";
import { Ban, Bell, ChevronRight, Crown, LogOut, MessageCircle } from "lucide-react-native";
import { Alert, ScrollView, Switch, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useNotificationPreferences } from "@/features/notifications";
import { DeleteAccountButton, useSettings } from "@/features/settings";
import { AppButton, BottomCta, ListRow, ListSectionTitle, NativeScreen } from "@/shared/components";

const SettingsScreen = () => {
  const { theme } = useUnistyles();
  const { logoutPending, logOut, deleteAccount, state } = useSettings();
  const { preferences, setPreference } = useNotificationPreferences();
  const chevron = <ChevronRight color={theme.colors.muted} size={20} strokeWidth={1.75} />;
  return (
    <NativeScreen>
      <ScrollView
        automaticallyAdjustsScrollIndicatorInsets
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ListSectionTitle title="알림" />
          <ListRow
            icon={<Bell color={theme.colors.text} size={20} strokeWidth={1.75} />}
            side={
              <Switch
                accessibilityLabel="새 매치 알림"
                onValueChange={(value) => setPreference("match", value)}
                trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.accent }}
                value={preferences.match}
              />
            }
            title="새 매치 알림"
          />
          <ListRow
            icon={<MessageCircle color={theme.colors.text} size={20} strokeWidth={1.75} />}
            side={
              <Switch
                accessibilityLabel="메시지 알림"
                onValueChange={(value) => setPreference("message", value)}
                trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.accent }}
                value={preferences.message}
              />
            }
            title="메시지 알림"
          />
        </View>
        <View>
          <ListSectionTitle title="계정" />
          <ListRow
            icon={<Ban color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => Alert.alert("차단 관리", "차단한 사용자 관리는 곧 지원할 예정이에요.")}
            side={chevron}
            title="차단 관리"
          />
          <ListRow
            icon={<Crown color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => router.push("/premium")}
            side={chevron}
            title="구독 관리"
          />
          <ListRow
            icon={<LogOut color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => void logOut()}
            title="로그아웃"
          />
          <View style={styles.dangerRow}>
            <DeleteAccountButton
              disabled={state.loading || logoutPending}
              onPress={deleteAccount}
            />
          </View>
        </View>
      </ScrollView>
      <BottomCta>
        <AppButton onPress={() => router.back()} title="완료" />
      </BottomCta>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.section,
    paddingBottom: theme.spacing.lg,
  },
  dangerRow: {
    paddingVertical: theme.spacing.sm,
  },
}));

export default SettingsScreen;
