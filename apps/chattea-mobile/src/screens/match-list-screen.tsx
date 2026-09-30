import { router } from "expo-router";
import { memo } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { useChatRooms } from "@/features/chat";
import { NewMatchAvatar as NewMatchAvatarComponent } from "@/features/matches";
import { useTranslation } from "@/i18n";
import { AppButton, EmptyState, ErrorState, LoadingState, NativeScreen } from "@/shared/components";

const NewMatchAvatar = memo(NewMatchAvatarComponent);
NewMatchAvatar.displayName = "NewMatchAvatar";

const MatchListScreen = () => {
  const { t } = useTranslation("matches");
  const { rooms, openRoom } = useChatRooms();
  const fresh = (rooms.data?.chatRooms ?? []).filter((room) => !room.lastMessage);
  return (
    <NativeScreen>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>{t("list.sectionTitle")}</Text>
        {rooms.loading ? (
          <LoadingState />
        ) : rooms.error ? (
          <ErrorState />
        ) : fresh.length ? (
          <ScrollView
            contentContainerStyle={styles.avatarRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {fresh.map((room) => (
              <NewMatchAvatar id={room.id} key={room.id} name={room.name} onPress={openRoom} />
            ))}
          </ScrollView>
        ) : (
          <EmptyState title={t("list.emptyTitle")} body={t("list.emptyBody")} />
        )}
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={styles.cta}>
        <AppButton onPress={() => router.push("/rooms")} title={t("list.startChat")} />
      </SafeAreaView>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  body: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: theme.spacing.screen,
  },
  avatarRow: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.md,
  },
  cta: {
    paddingBottom: theme.sizes.tabBar + theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.sm,
  },
}));

export default MatchListScreen;
