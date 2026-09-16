import { Stack } from "expo-router";

import { CommunityPostScreen } from "@/screens";

const CommunityPostRoute = () => {
  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <CommunityPostScreen />
    </>
  );
};

export default CommunityPostRoute;
