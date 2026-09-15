import { router, Stack } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MatchCandidateCard, useTodayMatches } from "@/features/matches";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeScreen,
  NativeScroll,
} from "@/shared/components";
import { formatTime } from "@/shared/lib";

const TodayMatchesScreen = () => {
  const {
    candidates,
    candidate,
    actionPending,
    act,
    undoLast,
    activateBoost,
    boostStateUnavailable,
    boostActive,
    activeBoostUntil,
  } = useTodayMatches();

  return (
    <>
      <NativeScreen>
        <NativeScroll>
          {candidates.loading ? <LoadingState /> : null}
          {candidates.error ? <ErrorState /> : null}
          {!candidates.loading && !candidates.error && !candidate ? (
            <EmptyState
              title="오늘의 인연을 모두 살펴봤어요"
              body="다음 추천이 준비되면 알려드릴게요."
            />
          ) : null}
          {candidate ? (
            <View style={styles.stack}>
              <MatchCandidateCard
                candidate={candidate}
                actionPending={actionPending}
                act={act}
                undoLast={undoLast}
              />
              <NativeButton
                disabled={actionPending || boostStateUnavailable || boostActive}
                label={
                  boostActive && activeBoostUntil
                    ? `${formatTime(activeBoostUntil)} 만료 · 부스트 사용 중`
                    : boostStateUnavailable
                      ? "부스트 상태 확인 중"
                      : "30분 부스트 사용하기"
                }
                onPress={() => void activateBoost()}
                tone="secondary"
                fullWidth
              />
            </View>
          ) : null}
        </NativeScroll>
      </NativeScreen>
      {process.env.EXPO_OS === "ios" ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="bell" onPress={() => router.push("/notifications")}>
            <Stack.Toolbar.Label>알림</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create((theme) => ({ stack: { gap: theme.spacing.md } }));

export default TodayMatchesScreen;
