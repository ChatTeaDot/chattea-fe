import { apolloClient } from "@/shared/graphql";

import { REGISTER_PUSH_TOKEN_MUTATION } from "./operations";

export const persistExpoPushToken = async (input: {
  token: string;
  platform: "ios" | "android";
}): Promise<boolean> => {
  const { data } = await apolloClient.mutate<{ registerPushToken: boolean }>({
    mutation: REGISTER_PUSH_TOKEN_MUTATION,
    variables: { input },
  });
  if (data?.registerPushToken === undefined)
    throw new Error("PUSH_TOKEN_REGISTRATION_EMPTY_RESPONSE");
  return data.registerPushToken;
};
