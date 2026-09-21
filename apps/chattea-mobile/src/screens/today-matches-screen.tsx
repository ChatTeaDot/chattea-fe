import { router, Stack } from "expo-router";
import { Bell, Sparkles } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { MatchActionBar, SwipeCard, useTodayMatches } from "@/features/matches";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeScreen,
} from "@/shared/components";
import type { AppTheme } from "@/theme";

const AndroidHeaderActions = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityLabel="새 매치"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push("/matches/list")}
      >
        <Sparkles color={theme.colors.text} size={22} />
      </Pressable>
      <Pressable
        accessibilityLabel="알림"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push("/notifications")}
      >
        <Bell color={theme.colors.text} size={22} />
      </Pressable>
    </View>
  );
};

const TodayMatchesScreen = () => {
  const { candidates, candidate, actionPending, act, undoLast } = useTodayMatches();
  const candidatesLoading = candidates.loading;
  const candidatesError = candidates.error;
  const refetchCandidates = candidates.refetch;
  const handleSwipe = (direction: "left" | "right") =>
    void act(direction === "right" ? "like" : "skip");
  const openDetail = () => candidate && router.push(`/candidate/${candidate.id}`);

  return (
    <>
      <NativeScreen>
        <GestureHandlerRootView style={styles.stage}>
          {candidatesLoading ? (
            <View style={styles.placeholder}>
              <LoadingState />
            </View>
          ) : candidatesError ? (
            <ErrorState />
          ) : candidate ? (
            <SwipeCard
              candidate={candidate}
              disabled={actionPending}
              key={candidate.id}
              onPress={openDetail}
              onSwipe={handleSwipe}
            />
          ) : (
            <View style={styles.placeholder}>
              <EmptyState
                title="오늘의 인연을 모두 살펴봤어요"
                body="다음 추천이 준비되면 알려드릴게요."
              />
              <NativeButton
                label="다시 불러오기"
                onPress={() => void refetchCandidates()}
                fullWidth
              />
            </View>
          )}
        </GestureHandlerRootView>
        {candidate ? (
          <MatchActionBar
            disabled={actionPending}
            onLike={() => void act("like")}
            onSkip={() => void act("skip")}
            onUndo={() => void undoLast()}
          />
        ) : null}
      </NativeScreen>
      {process.env.EXPO_OS === "ios" ? null : (
        <Stack.Screen options={{ headerRight: () => <AndroidHeaderActions /> }} />
      )}
      {process.env.EXPO_OS === "ios" ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="sparkles" onPress={() => router.push("/matches/list")}>
            <Stack.Toolbar.Label>새 매치</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
          <Stack.Toolbar.Button icon="bell" onPress={() => router.push("/notifications")}>
            <Stack.Toolbar.Label>알림</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginRight: theme.spacing.xs,
  },
  stage: {
    flex: 1,
    justifyContent: "center",
  },
  placeholder: {
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.screen,
  },
}));

export default TodayMatchesScreen;
