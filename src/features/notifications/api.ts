import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

export const NOTIFICATIONS_QUERY = gql`
  query NativeNotifications {
    notifications {
      id
      type
      title
      body
      route
      readAt
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation NativeMarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId)
  }
`;

const REGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation NativeRegisterPushToken($input: RegisterPushTokenInput!) {
    registerPushToken(input: $input)
  }
`;

const UNREGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation NativeUnregisterPushToken {
    unregisterPushToken
  }
`;

export const registerPushToken = async (input: {
  platform: "android" | "ios";
  token: string;
}): Promise<boolean> => {
  const result = await apolloClient.mutate<{ registerPushToken: boolean }>({
    mutation: REGISTER_PUSH_TOKEN_MUTATION,
    variables: { input },
  });
  if (result.data?.registerPushToken === undefined) {
    throw new Error("PUSH_TOKEN_REGISTRATION_EMPTY_RESPONSE");
  }
  return result.data.registerPushToken;
};

export const unregisterPushToken = async (): Promise<boolean> => {
  const result = await apolloClient.mutate<{ unregisterPushToken: boolean }>({
    mutation: UNREGISTER_PUSH_TOKEN_MUTATION,
  });
  if (result.data?.unregisterPushToken === undefined) {
    throw new Error("PUSH_TOKEN_UNREGISTER_EMPTY_RESPONSE");
  }
  return result.data.unregisterPushToken;
};
