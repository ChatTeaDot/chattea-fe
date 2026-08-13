import { useQuery } from "@apollo/client/react";

import { CURRENT_SUBSCRIPTION_QUERY } from "./api";
import { SUBSCRIPTION_PLANS } from "./types";

const subscriptionPlansResult = {
  data: SUBSCRIPTION_PLANS,
  error: undefined,
  isLoading: false,
  isPending: false,
  loading: false,
} as const;

export const useSubscriptionPlans = () => subscriptionPlansResult;

export const useMySubscription = () => {
  const result = useQuery(CURRENT_SUBSCRIPTION_QUERY);
  return {
    ...result,
    data: result.data?.currentSubscription,
    isLoading: result.loading,
    isPending: result.loading,
  };
};
