import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MatchPairAvatars } from "@/features/matches";
import { useCurrentUser } from "@/features/profile";
import { useTranslation } from "@/i18n";
import { AppButton } from "@/shared/components";
import { useRouteParam } from "@/shared/hooks";

const MatchSheetScreen = () => {
  const { t } = useTranslation("matches");
  const roomId = useRouteParam("room-id");
  const name = useRouteParam("name") ?? t("sheet.partnerFallback");
  const photo = useRouteParam("photo");
  const me = useCurrentUser();
  const startChat = () => {
    if (!roomId) return router.back();
    router.replace(`/rooms/${roomId}`);
  };
  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>{t("sheet.title")}</Text>
      <Text style={styles.sub}>{t("sheet.subtitle", { name })}</Text>
      <MatchPairAvatars candidatePhoto={photo} myPhoto={me.data?.me.photos[0]?.url} />
      <AppButton onPress={startChat} title={t("sheet.startChat")} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.later, pressed && styles.laterPressed]}
      >
        <Text style={styles.laterText}>{t("sheet.later")}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  sheet: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  later: {
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  laterPressed: {
    opacity: 0.62,
  },
  laterText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
}));

export default MatchSheetScreen;
