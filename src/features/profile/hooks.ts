import { useQuery } from "@tanstack/react-query";

import { getMySubscription } from "./api";
import { SUBSCRIPTION_PLANS } from "./types";

export const useSubscriptionPlans = () => {
  return useQuery({ queryKey: ["subscription-plans"], queryFn: async () => SUBSCRIPTION_PLANS });
};

export const useMySubscription = () => {
  return useQuery({ queryKey: ["my-subscription"], queryFn: getMySubscription });
};
