import { router } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { useChatRooms } from "@/features/chat";
import { NewMatchAvatar } from "@/features/matches";
import {
  AppButton,
  EmptyState,
  ErrorState,
  LoadingState,
  NativeScreen,
} from "@/shared/components";

const MatchListScreen = () => {
  const { rooms, openRoom } = useChatRooms();
  const fresh = (rooms.data?.chatRooms ?? []).filter((room) => !room.lastMessage);
  return (
    <NativeScreen>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>새로 매치된 사람</Text>
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
          <EmptyState
            title="아직 새로 매치된 사람이 없어요"
            body="서로 관심이 닿으면 여기에 보여드릴게요."
          />
        )}
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={styles.cta}>
        <AppButton onPress={() => router.push("/rooms")} title="채팅 시작" />
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
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.sm,
  },
}));

export default MatchListScreen;
