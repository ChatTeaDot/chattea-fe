import { gql } from "graphql-request";

import { graphQLRequest } from "@/shared/graphql";

import { CurrentSubscription } from "./types";

export const getMySubscription = async (): Promise<CurrentSubscription> => {
  const data = await graphQLRequest<{ currentSubscription: CurrentSubscription }>(gql`
    query CurrentSubscription {
      currentSubscription {
        planId
      }
    }
  `);

  return data.currentSubscription;
};
