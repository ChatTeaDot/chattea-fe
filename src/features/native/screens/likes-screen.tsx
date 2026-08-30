import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { memo, useCallback, useRef } from "react";
import { Text, View } from "react-native";

import {
  ContentPhoto,
  EmptyState,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeList,
  NativeScreen,
} from "@/features/native/components";
import { LIKE_USER_MUTATION, LIKED_ME_CANDIDATES_QUERY } from "@/features/native/operations";
import type { InteractionResult, MatchCandidate } from "@/features/native/types";

import {
  getLikesErrorKind,
  type LikedCandidatesData,
  runExclusiveAction,
  showActionError,
  styles,
} from "./screen-shared";

type CandidateRowProps = {
  age: number;
  disabled: boolean;
  id: string;
  intro: string;
  name: string;
  onInterest: (id: string) => void;
  photoUrl?: string;
  region: string;
};

const CandidateRow = memo(
  ({ age, disabled, id, intro, name, onInterest, photoUrl, region }: CandidateRowProps) => {
    const sendInterest = useCallback(() => onInterest(id), [id, onInterest]);
    return (
      <NativeCard>
        <ContentPhoto height={144} label={`${name}님의 사진`} recyclingKey={id} uri={photoUrl} />
        <Text style={styles.personName}>
          {name} {age}세
        </Text>
        <MetaText>{region}</MetaText>
        <Text style={styles.intro}>{intro}</Text>
        <NativeButton disabled={disabled} label="관심 보내기" onPress={sendInterest} fullWidth />
      </NativeCard>
    );
  },
);
CandidateRow.displayName = "CandidateRow";

const keyExtractor = (item: MatchCandidate) => item.id;

export const LikesScreen = () => {
  const likes = useQuery<LikedCandidatesData>(LIKED_ME_CANDIDATES_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [like, likeState] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const actionGuard = useRef(false);
  const refetchLikes = likes.refetch;
  const sendInterest = useCallback(
    async (candidateId: string) => {
      await runExclusiveAction(actionGuard, async () => {
        try {
          const response = await like({ variables: { userId: candidateId } });
          const result = response.data?.likeUser;
          if (result?.matched && result.roomId) router.push(`/rooms/${result.roomId}`);
          await refetchLikes();
        } catch (error) {
          showActionError(error);
        }
      });
    },
    [like, refetchLikes],
  );
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
