import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components";
import { spacing } from "@/theme/tokens";

import {
  useBlackMatchCandidates,
  useLikedMeCandidates,
  useLikeUser,
  useMatchCandidates,
  useMySubscription,
  useRateScore,
} from "./hooks";
import { MatchCandidateCard } from "./match-candidate-card";
import { MatchCandidateSection } from "./match-candidate-section";
import { MatchCandidate } from "./types";

export const MatchScreen = () => {
  const candidates = useMatchCandidates();
  const subscription = useMySubscription();
  const blackCandidates = useBlackMatchCandidates(subscription.data?.planId === "black");
  const likedMeCandidates = useLikedMeCandidates(
    subscription.data?.planId === "basic" ||
      subscription.data?.planId === "gold" ||
      subscription.data?.planId === "black",
  );
  const like = useLikeUser();
  const rate = useRateScore();
  const isPaidPlan =
    subscription.data?.planId === "basic" ||
    subscription.data?.planId === "gold" ||
    subscription.data?.planId === "black";

  const renderCandidate = ({ item }: { item: MatchCandidate }) => {
    return (
      <MatchCandidateCard
        candidate={item}
        likeDisabled={like.isPending}
        onLike={() => likeCandidate(item.id)}
        onRate={() => rate.mutate({ userId: item.id, score: 5 })}
        rateDisabled={rate.isPending}
      />
    );
  };

  const likeCandidate = (userId: string) => {
    like.mutate(userId, {
      onSuccess: (result) => {
        if (result.roomId) {
          router.push(`/room/${result.roomId}`);
        }
      },
      onError: (error) => {
        const message = (error instanceof Error ? error.message : String(error)) ?? "";
        if (message.includes("LIKE_LIMIT_REACHED")) {
          Alert.alert(
            "오늘의 좋아요 사용량 초과",
            "좋아요 제한에 걸렸습니다. 플랜 업그레이드를 확인해 주세요.",
          );
          return;
        }
        if (message.includes("LIKE_SELF_NOT_ALLOWED")) {
          Alert.alert("좋아요 불가", "자기 자신은 좋아요할 수 없습니다.");
          return;
        }
        Alert.alert("좋아요 처리 실패", "다시 시도해 주세요.");
      },
    });
  };

  return (
    <Screen>
      {subscription.data?.planId === "black" ? (
        <MatchCandidateSection
          candidates={blackCandidates.data ?? []}
          renderCandidate={renderCandidate}
          title="Black 추천"
        />
      ) : null}
      {isPaidPlan ? (
        <MatchCandidateSection
          candidates={likedMeCandidates.data ?? []}
          renderCandidate={renderCandidate}
          title="나를 좋아한 사람"
        />
      ) : null}
      <LegendList
        recycleItems={false}
        data={candidates.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderCandidate}
        contentContainerStyle={styles.list}
        style={styles.listFrame}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});
