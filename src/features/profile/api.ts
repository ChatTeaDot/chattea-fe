import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import type { CurrentSubscription } from "./types";

type CurrentSubscriptionData = { readonly currentSubscription: CurrentSubscription };

export const CURRENT_SUBSCRIPTION_QUERY: TypedDocumentNode<CurrentSubscriptionData> = gql`
  query CurrentSubscription {
    currentSubscription {
      planId
    }
  }
`;
