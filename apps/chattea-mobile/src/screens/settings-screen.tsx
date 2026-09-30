import { router } from "expo-router";
import { Ban, Bell, ChevronRight, Crown, LogOut, MessageCircle } from "lucide-react-native";
import { Alert, ScrollView, Switch, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useNotificationPreferences } from "@/features/notifications";
import { DeleteAccountButton, useSettings } from "@/features/settings";
import { useTranslation } from "@/i18n";
import { AppButton, BottomCta, ListRow, ListSectionTitle, NativeScreen } from "@/shared/components";

const SettingsScreen = () => {
  const { t } = useTranslation("settings");
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
          <ListSectionTitle title={t("sections.notifications")} />
          <ListRow
            icon={<Bell color={theme.colors.text} size={20} strokeWidth={1.75} />}
            side={
              <Switch
                accessibilityLabel={t("rows.matchAlerts")}
                onValueChange={(value) => setPreference("match", value)}
                trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.accent }}
                value={preferences.match}
              />
            }
            title={t("rows.matchAlerts")}
          />
          <ListRow
            icon={<MessageCircle color={theme.colors.text} size={20} strokeWidth={1.75} />}
            side={
              <Switch
                accessibilityLabel={t("rows.messageAlerts")}
                onValueChange={(value) => setPreference("message", value)}
                trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.accent }}
                value={preferences.message}
              />
            }
            title={t("rows.messageAlerts")}
          />
        </View>
        <View>
          <ListSectionTitle title={t("sections.account")} />
          <ListRow
            icon={<Ban color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => Alert.alert(t("blocked.title"), t("blocked.body"))}
            side={chevron}
            title={t("rows.blocked")}
          />
          <ListRow
            icon={<Crown color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => router.push("/premium")}
            side={chevron}
            title={t("rows.subscription")}
          />
          <ListRow
            icon={<LogOut color={theme.colors.text} size={20} strokeWidth={1.75} />}
            onPress={() => void logOut()}
            title={t("rows.logout")}
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
        <AppButton onPress={() => router.back()} title={t("common:actions.done")} />
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
