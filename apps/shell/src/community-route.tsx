import { lazy, Suspense } from "react";

import { ErrorBoundary } from "./lib";

const CommunityApp = lazy(() => import("chattea_web/CommunityApp"));

const RemoteLoadFailed = () => (
  <main>
    <p>커뮤니티 앱을 불러오지 못했어요</p>
    <button onClick={() => window.location.reload()} type="button">
      다시 시도
    </button>
  </main>
);

const CommunityRoute = () => (
  <ErrorBoundary fallback={() => <RemoteLoadFailed />}>
    <Suspense fallback={<p>불러오는 중…</p>}>
      <CommunityApp />
    </Suspense>
  </ErrorBoundary>
);

export default CommunityRoute;
