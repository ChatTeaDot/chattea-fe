import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MatchCandidate } from "@/features/matches";
import {
  CandidateRow as CandidateRowComponent,
  getLikesErrorKind,
  useLikes,
} from "@/features/matches";
import {
  EmptyState,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const CandidateRow = memo(CandidateRowComponent);
CandidateRow.displayName = "CandidateRow";

const keyExtractor = (item: MatchCandidate) => item.id;

const LikesScreen = () => {
  const { likes, likeState, sendInterest, refetchLikes } = useLikes();
  const renderCandidate = useCallback(
    ({ item }: { item: MatchCandidate }) => (
      <CandidateRow
        age={item.age}
        disabled={likes.loading || likeState.loading}
        id={item.id}
        intro={item.intro}
        name={item.userName}
        onInterest={sendInterest}
        photoUrl={item.photos[0]?.url}
        region={item.region}
      />
    ),
    [likeState.loading, likes.loading, sendInterest],
  );
  const errorKind = likes.error ? getLikesErrorKind(likes.error) : undefined;
  const empty = likes.loading ? (
    <LoadingState />
  ) : errorKind === "entitlement" ? (
    <NativeCard>
      <Text style={styles.postTitle}>이 기능은 구독에서 이용할 수 있어요</Text>
      <MetaText>나를 좋아한 사람을 보고 싶다면 플랜을 확인해 보세요.</MetaText>
      <NativeButton label="플랜 확인하기" onPress={() => router.push("/premium")} fullWidth />
    </NativeCard>
  ) : errorKind === "retryable" ? (
    <NativeCard>
      <Text style={styles.postTitle}>좋아요를 불러오지 못했어요</Text>
      <MetaText>잠시 후 다시 시도해 주세요.</MetaText>
      <NativeButton label="다시 시도" onPress={() => void refetchLikes()} fullWidth />
    </NativeCard>
  ) : (
    <EmptyState title="아직 받은 관심이 없어요" body="오늘의 인연에서 먼저 마음을 전해 보세요." />
  );
  return (
    <NativeScreen>
      <NativeList
        data={likes.error ? [] : (likes.data?.likedMeCandidates ?? [])}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        ListHeaderComponent={
          <View>
            <Text style={styles.guide}>나에게 관심을 보낸 사람을 확인해 보세요.</Text>
          </View>
        }
        renderItem={renderCandidate}
      />
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  guide: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
}));

export default LikesScreen;
