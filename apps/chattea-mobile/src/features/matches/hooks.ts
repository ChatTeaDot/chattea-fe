import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { CONSUMABLE_BALANCE_QUERY, type ConsumableBalance } from "@/features/billing";
import { useRouteParam } from "@/shared/hooks";
import { formatTime, runExclusiveAction } from "@/shared/lib";

import {
  ACTIVATE_BOOST_MUTATION,
  type ActivateBoostData,
  type CandidatesData,
  type InteractionResult,
  LIKE_USER_MUTATION,
  LIKED_ME_CANDIDATES_QUERY,
  type LikedCandidatesData,
  MATCH_CANDIDATES_QUERY,
  type MatchCandidate,
  SKIP_CANDIDATE_MUTATION,
  SUPERLIKE_MUTATION,
  UNDO_MATCH_ACTION_MUTATION,
} from "./api";
import { MAX_TIMER_DELAY_MS } from "./constants";
import { getLikesErrorKind, openMatchSheet, showMatchActionError } from "./utils";

export const useTodayMatches = () => {
  const candidates = useQuery<CandidatesData>(MATCH_CANDIDATES_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [like, likeState] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const [skip, skipState] = useMutation<{ skipMatchCandidate: boolean }>(SKIP_CANDIDATE_MUTATION);
  const [superLike, superLikeState] = useMutation<{ superLikeUser: InteractionResult }>(
    SUPERLIKE_MUTATION,
  );
  const [undo, undoState] = useMutation<{ undoLastMatchAction: { reverted: boolean } }>(
    UNDO_MATCH_ACTION_MUTATION,
  );
  const [boost, boostState] = useMutation<ActivateBoostData>(ACTIVATE_BOOST_MUTATION, {
    update: (cache, result) => {
      const activation = result.data?.activateBoost;
      if (!activation) return;
      cache.updateQuery<{ consumableBalance: ConsumableBalance }>(
        { query: CONSUMABLE_BALANCE_QUERY },
        (current) =>
          current
            ? {
                consumableBalance: {
                  ...current.consumableBalance,
                  activeBoostUntil: activation.activeUntil,
                  boostCredits: activation.remainingBoostCredits,
                },
              }
            : current,
      );
    },
  });
  const actionGuard = useRef(false);
  const [boostClock, setBoostClock] = useState(Date.now);
  const candidate = candidates.data?.matchCandidates[0];
  const activeBoostUntil = balance.data?.consumableBalance.activeBoostUntil;
  const activeBoostTimestamp =
    typeof activeBoostUntil === "string" ? Date.parse(activeBoostUntil) : null;
  const hasInvalidBoostBoundary =
    typeof activeBoostUntil === "string" && !Number.isFinite(activeBoostTimestamp);
  const boostActive =
    typeof activeBoostTimestamp === "number" &&
    Number.isFinite(activeBoostTimestamp) &&
    activeBoostTimestamp > boostClock;
  const boostStateUnavailable =
    balance.loading ||
    Boolean(balance.error) ||
    activeBoostUntil === undefined ||
    hasInvalidBoostBoundary;
  const actionPending =
    candidates.loading ||
    likeState.loading ||
    skipState.loading ||
    superLikeState.loading ||
    undoState.loading ||
    boostState.loading;

  useEffect(() => {
    if (!boostActive || activeBoostTimestamp === null) return;
    const remainingMs = Math.max(0, activeBoostTimestamp - Date.now() + 100);
    const timer = setTimeout(
      () => setBoostClock(Date.now()),
      Math.min(remainingMs, MAX_TIMER_DELAY_MS),
    );
    return () => clearTimeout(timer);
  }, [activeBoostTimestamp, boostActive, boostClock]);

  const refresh = () => candidates.refetch();
  const act = async (kind: "like" | "skip" | "superlike") => {
    if (!candidate) return;
    await runExclusiveAction(actionGuard, async () => {
      try {
        if (kind === "skip") {
          await skip({ variables: { userId: candidate.id } });
        } else {
          const result =
            kind === "like"
              ? (await like({ variables: { userId: candidate.id } })).data?.likeUser
              : (await superLike({ variables: { userId: candidate.id } })).data?.superLikeUser;
          if (result?.matched && result.roomId) {
            openMatchSheet(candidate, result.roomId);
          }
        }
        await refresh();
      } catch (error) {
        showMatchActionError(error);
      }
    });
  };

  const undoLast = async () => {
    await runExclusiveAction(actionGuard, async () => {
      try {
        const response = await undo();
        if (!response.data?.undoLastMatchAction.reverted) {
          Alert.alert("되돌릴 선택이 없어요", "새로운 인연을 살펴봐 주세요.");
          return;
        }
        await refresh();
      } catch (error) {
        showMatchActionError(error);
      }
    });
  };

  const activateBoost = async () => {
    await runExclusiveAction(actionGuard, async () => {
      try {
        const response = await boost();
        const activation = response.data?.activateBoost;
        if (
          !activation ||
          !Number.isFinite(Date.parse(activation.activeUntil)) ||
          !Number.isInteger(activation.remainingBoostCredits) ||
          activation.remainingBoostCredits < 0
        ) {
          throw new Error("BOOST_ACTIVATION_EMPTY_RESPONSE");
        }
        Alert.alert(
          "부스트를 시작했어요",
          `${formatTime(activation.activeUntil)}까지 더 많은 사람에게 보여드릴게요.`,
        );
      } catch (error) {
        showMatchActionError(error);
      }
    });
  };

  return {
    candidates,
    candidate,
    actionPending,
    act,
    undoLast,
    activateBoost,
    boostStateUnavailable,
    boostActive,
    activeBoostUntil,
  };
};

export const useLikes = () => {
  const likes = useQuery<LikedCandidatesData>(LIKED_ME_CANDIDATES_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [like, likeState] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const actionGuard = useRef(false);
  const refetchLikes = likes.refetch;
  const likesData = useMemo(() => likes.data?.likedMeCandidates ?? [], [likes.data]);
  const sendInterest = useCallback(
    async (candidateId: string) => {
      await runExclusiveAction(actionGuard, async () => {
        try {
          const response = await like({ variables: { userId: candidateId } });
          const result = response.data?.likeUser;
          const target = likesData.find((item) => item.id === candidateId);
          if (result?.matched && result.roomId && target) openMatchSheet(target, result.roomId);
          await refetchLikes();
        } catch (error) {
          showMatchActionError(error);
        }
      });
    },
    [like, likesData, refetchLikes],
  );

  return { likes, likeState, sendInterest, refetchLikes };
};

export const useCandidateDetail = () => {
  const candidateId = useRouteParam("candidate-id");
  const candidates = useQuery<CandidatesData>(MATCH_CANDIDATES_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const liked = useQuery<LikedCandidatesData>(LIKED_ME_CANDIDATES_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [like, likeState] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const actionGuard = useRef(false);
  const likedError =
    liked.error && getLikesErrorKind(liked.error) !== "entitlement" ? liked.error : undefined;
  const candidate: MatchCandidate | undefined = [
    ...(candidates.data?.matchCandidates ?? []),
    ...(liked.data?.likedMeCandidates ?? []),
  ].find((item) => item.id === candidateId);

  const sendLike = useCallback(async () => {
    if (!candidate) return;
    await runExclusiveAction(actionGuard, async () => {
      try {
        const response = await like({ variables: { userId: candidate.id } });
        const result = response.data?.likeUser;
        if (result?.matched && result.roomId) {
          openMatchSheet(candidate, result.roomId);
        } else {
          router.back();
        }
      } catch (error) {
        showMatchActionError(error);
      }
    });
  }, [candidate, like]);

  return {
    candidate,
    error: candidates.error ?? likedError,
    likePending: likeState.loading,
    loading: candidates.loading || (liked.loading && !likedError),
    sendLike,
  };
};
