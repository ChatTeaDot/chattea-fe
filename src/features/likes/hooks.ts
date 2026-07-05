import { useQuery } from "@tanstack/react-query";

import { listLikedMeCandidates } from "./api";

export const useLikedMeCandidates = (enabled: boolean) => {
  return useQuery({
    queryKey: ["liked-me-candidates"],
    queryFn: listLikedMeCandidates,
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
};
