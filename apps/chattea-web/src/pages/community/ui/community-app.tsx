import "@mantine/core/styles.css";

import { AppMantineProvider } from "@/shared/ui/mantine";

import CommunityPage from "./community-page";

const CommunityApp = () => (
  <AppMantineProvider>
    <CommunityPage />
  </AppMantineProvider>
);

export default CommunityApp;
