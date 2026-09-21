import { Suspense } from "react";

import { COMMUNITY_FALLBACK } from "@/shared/config/constants";

import CommunityTitle from "./community-title";

const CommunityPage = () => (
  <main>
    <Suspense fallback={<p>{COMMUNITY_FALLBACK}</p>}>
      <CommunityTitle />
    </Suspense>
  </main>
);

export default CommunityPage;
