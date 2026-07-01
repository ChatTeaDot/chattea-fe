import { Stack } from "expo-router";

import { RootProvider, withSentry } from "@/providers";

const RootLayout = () => {
  return (
    <RootProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RootProvider>
  );
};

export default withSentry(RootLayout);
