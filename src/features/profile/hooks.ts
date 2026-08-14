import { useQuery } from "@apollo/client/react";

import { CURRENT_SUBSCRIPTION_QUERY } from "./api";

export const useMySubscription = () => {
  const result = useQuery(CURRENT_SUBSCRIPTION_QUERY);
  return {
    ...result,
    data: result.data?.currentSubscription,
    isLoading: result.loading,
    isPending: result.loading,
  };
};
