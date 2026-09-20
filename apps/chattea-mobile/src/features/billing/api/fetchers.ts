import { type ApolloClient, gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type { BackendBillingState, ConsumableBalance, CurrentSubscription } from "./schemas";

export const BILLING_PRODUCTS_QUERY = gql`
  query NativeBillingProducts {
    billingProducts {
      id
      kind
      name
    }
  }
`;

export const CONSUMABLE_BALANCE_QUERY = gql`
  query NativeConsumableBalance {
    consumableBalance {
      superLikeCredits
      boostCredits
      activeBoostUntil
    }
  }
`;

export const CURRENT_SUBSCRIPTION_QUERY = gql`
  query NativeCurrentSubscription {
    currentSubscription {
      planId
    }
  }
`;

export const readBackendBillingState = (): BackendBillingState | null => {
  const balance = apolloClient.readQuery<{ consumableBalance: ConsumableBalance }>({
    query: CONSUMABLE_BALANCE_QUERY,
  });
  const subscription = apolloClient.readQuery<{ currentSubscription: CurrentSubscription }>({
    query: CURRENT_SUBSCRIPTION_QUERY,
  });
  if (!balance?.consumableBalance || !subscription?.currentSubscription) return null;
  return {
    boostCredits: balance.consumableBalance.boostCredits,
    planId: subscription.currentSubscription.planId,
    superLikeCredits: balance.consumableBalance.superLikeCredits,
  };
};

export const refreshBackendBillingState = async (
  client: ApolloClient = apolloClient,
): Promise<BackendBillingState | null> => {
  const [balanceResult, subscriptionResult] = await Promise.all([
    client.query<{ consumableBalance: ConsumableBalance }>({
      fetchPolicy: "network-only",
      query: CONSUMABLE_BALANCE_QUERY,
    }),
    client.query<{ currentSubscription: CurrentSubscription }>({
      fetchPolicy: "network-only",
      query: CURRENT_SUBSCRIPTION_QUERY,
    }),
  ]);
  const balance = balanceResult.data?.consumableBalance;
  const subscription = subscriptionResult.data?.currentSubscription;
  if (!balance || !subscription) return null;
  return {
    boostCredits: balance.boostCredits,
    planId: subscription.planId,
    superLikeCredits: balance.superLikeCredits,
  };
};
