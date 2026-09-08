import { gql } from "@apollo/client";

export const REQUEST_ACCOUNT_DELETION_MUTATION = gql`
  mutation NativeRequestAccountDeletion {
    requestAccountDeletion {
      hidden
      scheduledFor
    }
  }
`;
