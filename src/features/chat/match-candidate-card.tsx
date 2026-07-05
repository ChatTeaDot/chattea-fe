import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppButton } from "@/shared/components";
import { colors, spacing } from "@/theme/tokens";

import { MatchCandidate } from "./types";

type MatchCandidateCardProps = {
  candidate: MatchCandidate;
  likeDisabled: boolean;
  rateDisabled: boolean;
  onLike: () => void;
  onRate: () => void;
};

export const MatchCandidateCard = ({
  candidate,
  likeDisabled,
  rateDisabled,
  onLike,
  onRate,
}: MatchCandidateCardProps) => {
  const detail = getCandidateDetail(candidate);

  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        <Text style={styles.initial}>{candidate.userName.slice(0, 1)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {candidate.planId === "black" ? "Black" : "오늘 추천"}
          </Text>
        </View>
      </View>
      <View style={styles.profile}>
        <View>
          <Text style={styles.name}>{candidate.userName}</Text>
          <Text style={styles.meta}>{detail.meta}</Text>
        </View>
        <Text style={styles.intro}>{candidate.intro || "소개가 아직 없어요"}</Text>
        <View style={styles.chips}>
          {detail.chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.prompt}>{detail.prompt}</Text>
      </View>
      <View style={styles.actions}>
        <AppButton
          disabled={rateDisabled}
          onPress={onRate}
          title="매너 점수 남기기"
          variant="soft"
        />
        <AppButton
          disabled={candidate.likedByMe || likeDisabled}
          onPress={onLike}
          title={candidate.likedByMe ? "관심 보냄" : "관심 보내기"}
        />
      </View>
    </View>
  );
};

const getCandidateDetail = (candidate: MatchCandidate) => {
  if (candidate.blackRecommended) {
    return {
      meta: "오늘 밤 대화 확률 높음 · Black 추천",
      chips: ["진지한 만남", "저녁 산책", "티타임"],
      prompt: "첫 문장 추천: 오늘 하루를 차 한잔으로 표현하면 어떤 맛인가요?",
    };
  }

  return {
    meta: "서울 근처 · 차분한 대화 선호",
    chips: ["대화 우선", "느린 호감", "주말 약속"],
    prompt: "첫 문장 추천: 요즘 가장 편안했던 순간을 물어보세요.",
  };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.md,
  },
  photo: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 20,
    height: 210,
    justifyContent: "center",
  },
  initial: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: "900",
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    bottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: "absolute",
    right: spacing.md,
  },
  badgeText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "800",
  },
  profile: {
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  meta: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "700",
  },
  intro: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  prompt: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: spacing.sm,
  },
});
