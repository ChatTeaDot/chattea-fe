import { useQuery } from "@apollo/client/react";

import { LIKED_ME_CANDIDATES_QUERY } from "./api";

export const useLikedMeCandidates = (enabled: boolean) => {
  const result = useQuery(LIKED_ME_CANDIDATES_QUERY, { skip: !enabled });
  return {
    ...result,
    data: result.data?.likedMeCandidates,
    isLoading: result.loading,
    isPending: result.loading,
  };
};
