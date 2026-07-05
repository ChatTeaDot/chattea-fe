import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  blockUser,
  likeUser,
  listBlackMatchCandidates,
  listMatchCandidates,
  rateScore,
} from "./api";

export const useMatchCandidates = () => {
  return useQuery({ queryKey: ["match-candidates"], queryFn: listMatchCandidates });
};

export const useBlackMatchCandidates = (enabled: boolean) => {
  return useQuery({
    queryKey: ["black-match-candidates"],
    queryFn: listBlackMatchCandidates,
    enabled,
  });
};

export const useLikeUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["match-candidates"] });
      void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useRateScore = () => {
  return useMutation({ mutationFn: rateScore });
};

export const useBlockUser = () => {
  return useMutation({ mutationFn: blockUser });
};
