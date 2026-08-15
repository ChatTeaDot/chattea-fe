import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { Text } from "react-native";

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
import { LIKE_USER_MUTATION, LIKED_ME_CANDIDATES_QUERY } from "../operations";
import type { InteractionResult, MatchCandidate } from "../types";
import { type LikedCandidatesData, showActionError, styles } from "./screen-shared";

export const LikesScreen = () => {
  const likes = useQuery<LikedCandidatesData>(LIKED_ME_CANDIDATES_QUERY);
  const [like] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const sendInterest = async (candidate: MatchCandidate) => {
    try {
      const response = await like({ variables: { userId: candidate.id } });
      const result = response.data?.likeUser;
      if (result?.matched && result.roomId) router.push(`/rooms/${result.roomId}`);
      void likes.refetch();
    } catch (error) {
      showActionError(error);
    }
  };
  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>나에게 관심을 보낸 사람을 확인해 보세요.</Text>
        {likes.loading ? <LoadingState /> : null}
        {likes.error ? (
          <NativeCard>
            <Text style={styles.postTitle}>이 기능은 구독에서 이용할 수 있어요</Text>
            <MetaText>나를 좋아한 사람을 보고 싶다면 플랜을 확인해 보세요.</MetaText>
            <NativeButton label="플랜 확인하기" onPress={() => router.push("/premium")} fullWidth />
          </NativeCard>
        ) : null}
        {!likes.loading && !likes.error && likes.data?.likedMeCandidates.length === 0 ? (
          <EmptyState
            title="아직 받은 관심이 없어요"
            body="오늘의 인연에서 먼저 마음을 전해 보세요."
          />
        ) : null}
        {likes.data?.likedMeCandidates.map((candidate) => (
          <NativeCard key={candidate.id}>
            <ContentPhoto
              height={144}
              label={`${candidate.userName}님의 사진`}
              uri={candidate.photos[0]?.url}
            />
            <Text style={styles.personName}>
              {candidate.userName} {candidate.age}세
            </Text>
            <MetaText>{candidate.region}</MetaText>
            <Text style={styles.intro}>{candidate.intro}</Text>
            <NativeButton
              label="관심 보내기"
              onPress={() => void sendInterest(candidate)}
              fullWidth
            />
          </NativeCard>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};
