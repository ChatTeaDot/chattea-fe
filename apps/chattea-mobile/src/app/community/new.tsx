import { Stack } from "expo-router";

import { CommunityWriteScreen } from "@/screens";

const CommunityWriteRoute = () => {
  return (
    <>
      <Stack.Screen options={{ presentation: "card", title: "글쓰기" }} />
      <CommunityWriteScreen />
    </>
  );
};

export default CommunityWriteRoute;
