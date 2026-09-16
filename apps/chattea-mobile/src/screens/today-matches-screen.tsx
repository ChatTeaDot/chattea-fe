import { router, Stack } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

import { MatchActionBar, SwipeCard, useTodayMatches } from "@/features/matches";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeScreen,
} from "@/shared/components";

const TodayMatchesScreen = () => {
  const { candidates, candidate, actionPending, act, undoLast } = useTodayMatches();
  const handleSwipe = useCallback(
    (direction: "left" | "right") => void act(direction === "right" ? "like" : "skip"),
    [act],
  );
  const openDetail = useCallback(
    () => candidate && router.push(`/candidate/${candidate.id}`),
    [candidate],
  );

  return (
    <>
      <NativeScreen>
        <GestureHandlerRootView style={styles.stage}>
          {candidates.loading ? (
            <View style={styles.placeholder}>
              <LoadingState />
            </View>
          ) : candidates.error ? (
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
                onPress={() => void candidates.refetch()}
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
      {process.env.EXPO_OS === "ios" ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="sparkles"
            onPress={() => router.push("/matches/list")}
          >
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
