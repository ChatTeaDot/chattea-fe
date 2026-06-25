import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../shared/components/app-button";
import { Screen } from "../../shared/components/screen";
import { colors, spacing } from "../../theme/tokens";
import {
  useBlackMatchCandidates,
  useLikedMeCandidates,
  useLikeUser,
  useMatchCandidates,
  useMySubscription,
  useRateProfile,
} from "./hooks";
import { MatchCandidate } from "./types";

export function MatchScreen() {
  const candidates = useMatchCandidates();
  const subscription = useMySubscription();
  const blackCandidates = useBlackMatchCandidates(subscription.data?.planId === "black");
  const likedMeCandidates = useLikedMeCandidates(subscription.data?.planId !== "free");
  const like = useLikeUser();
  const rate = useRateProfile();
  const isPaidPlan = subscription.data?.planId !== "free";

  function renderCandidate({ item }: { item: MatchCandidate }) {
    return (
      <View style={styles.row}>
        <View style={styles.profile}>
          <Text style={styles.name}>{item.nickname}</Text>
          <Text style={styles.intro}>{item.intro || "소개가 아직 없어요"}</Text>
        </View>
        <AppButton
          disabled={item.likedByMe || like.isPending}
          title={item.likedByMe ? "좋아요 완료" : "좋아요"}
          onPress={() => {
            like.mutate(item.id, {
              onSuccess(result) {
                if (result.roomId) {
                  router.push(`/room/${result.roomId}`);
                }
              },
              onError(error) {
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
          }}
        />
        <AppButton
          disabled={rate.isPending}
          title="프로필 좋아요"
          onPress={() => rate.mutate({ userId: item.id, score: 5 })}
        />
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>매칭</Text>
        <View style={styles.nav}>
          <Pressable accessibilityRole="button" onPress={() => router.push("/plans")}>
            <Text style={styles.link}>플랜</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/community")}>
            <Text style={styles.link}>커뮤니티</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/rooms")}>
            <Text style={styles.link}>채팅</Text>
          </Pressable>
        </View>
      </View>
      {subscription.data?.planId === "black" ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Black 추천</Text>
          <LegendList
            data={blackCandidates.data ?? []}
            keyExtractor={(item) => `black-${item.id}`}
            renderItem={renderCandidate}
            contentContainerStyle={styles.list}
          />
        </View>
      ) : null}
      {isPaidPlan ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>나를 좋아한 사람</Text>
          <LegendList
            data={likedMeCandidates.data ?? []}
            keyExtractor={(item) => `liked-me-${item.id}`}
            renderItem={renderCandidate}
            contentContainerStyle={styles.list}
          />
        </View>
      ) : null}
      <LegendList
        data={candidates.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderCandidate}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  nav: {
    flexDirection: "row",
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  profile: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  intro: {
    color: colors.muted,
    fontSize: 15,
  },
});
