import { useMutation, useQuery } from "@apollo/client/react";
import { router, Stack } from "expo-router";
import { Alert, Text, View } from "react-native";

import {
  ContentPhoto,
  EmptyState,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
} from "../components";
import {
  ACTIVATE_BOOST_MUTATION,
  LIKE_USER_MUTATION,
  MATCH_CANDIDATES_QUERY,
  SKIP_CANDIDATE_MUTATION,
  SUPERLIKE_MUTATION,
  UNDO_MATCH_ACTION_MUTATION,
} from "../operations";
import type { InteractionResult } from "../types";
import {
  type CandidatesData,
  ErrorState,
  formatTime,
  showActionError,
  styles,
} from "./screen-shared";

export const TodayMatchesScreen = () => {
  const candidates = useQuery<CandidatesData>(MATCH_CANDIDATES_QUERY);
  const [like] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const [skip] = useMutation<{ skipMatchCandidate: boolean }>(SKIP_CANDIDATE_MUTATION);
  const [superLike] = useMutation<{ superLikeUser: InteractionResult }>(SUPERLIKE_MUTATION);
  const [undo] = useMutation<{ undoLastMatchAction: { reverted: boolean } }>(
    UNDO_MATCH_ACTION_MUTATION,
  );
  const [boost] = useMutation<{ activateBoost: { activeUntil: string } }>(ACTIVATE_BOOST_MUTATION);
  const candidate = candidates.data?.matchCandidates[0];

  const refresh = () => void candidates.refetch();
  const act = async (kind: "like" | "skip" | "superlike") => {
    if (!candidate) return;
    try {
      if (kind === "skip") {
        await skip({ variables: { userId: candidate.id } });
      } else {
        const result =
          kind === "like"
            ? (await like({ variables: { userId: candidate.id } })).data?.likeUser
            : (await superLike({ variables: { userId: candidate.id } })).data?.superLikeUser;
        if (result?.matched && result.roomId) {
          Alert.alert("서로 관심이 닿았어요", "바로 대화를 시작해 볼까요?", [
            { text: "나중에", style: "cancel" },
            { text: "대화하기", onPress: () => router.push(`/rooms/${result.roomId}`) },
          ]);
        }
      }
      refresh();
    } catch (error) {
      showActionError(error);
    }
  };

  const undoLast = async () => {
    try {
      const response = await undo();
      if (!response.data?.undoLastMatchAction.reverted) {
        Alert.alert("되돌릴 선택이 없어요", "새로운 인연을 살펴봐 주세요.");
        return;
      }
      refresh();
    } catch (error) {
      showActionError(error);
    }
  };

  const activateBoost = async () => {
    try {
      const response = await boost();
      const activeUntil = response.data?.activateBoost.activeUntil;
      Alert.alert(
        "부스트를 시작했어요",
        activeUntil ? `${formatTime(activeUntil)}까지 더 많은 사람에게 보여드릴게요.` : "",
      );
    } catch (error) {
      showActionError(error);
    }
  };

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
              <NativeCard>
                <ContentPhoto
                  label={`${candidate.userName}님의 대표 사진`}
                  uri={candidate.photos[0]?.url}
                />
                <View style={styles.profileHeader}>
                  <View style={styles.stackTight}>
                    <Text style={styles.personName}>
                      {candidate.userName} {candidate.age}세
                    </Text>
                    <MetaText>{candidate.region}</MetaText>
                  </View>
                  {candidate.boostActive ? (
                    <Text style={styles.statusText}>지금 더 많은 사람에게 보여지고 있어요</Text>
                  ) : null}
                </View>
                <Text style={styles.intro}>
                  {candidate.intro || "반가워요. 이야기를 나눠 보고 싶어요."}
                </Text>
                <View style={styles.actionRow}>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="이번엔 넘기기"
                      onPress={() => void act("skip")}
                      tone="secondary"
                      fullWidth
                    />
                  </View>
                  <View style={styles.actionGrow}>
                    <NativeButton label="관심 보내기" onPress={() => void act("like")} fullWidth />
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="슈퍼라이크"
                      onPress={() => void act("superlike")}
                      tone="quiet"
                      fullWidth
                    />
                  </View>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="되돌리기"
                      onPress={() => void undoLast()}
                      tone="quiet"
                      fullWidth
                    />
                  </View>
                </View>
              </NativeCard>
              <NativeButton
                label="30분 부스트 사용하기"
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
