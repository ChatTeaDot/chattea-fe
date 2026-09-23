import { Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ErrorBoundary } from "@/shared/lib";

import { openWrite } from "../bridge";
import { COMMUNITY_POSTS_QUERY_KEY } from "../api";

import {
  page,
  retryButton,
  stateBody,
  stateTitle,
  stateWrap,
  writeFab,
} from "./community-page.css";
import PostList from "./post-list";

const hasAuthToken = () =>
  typeof window !== "undefined" && Boolean(window.__CHATTEA_AUTH__?.authorization);

const signedOut = () => typeof window !== "undefined" && !hasAuthToken();

const LoadingState = () => (
  <div className={stateWrap}>
    <span className={stateBody}>불러오는 중…</span>
  </div>
);

const CommunityPage = () => {
  const queryClient = useQueryClient();

  let content;
  if (signedOut()) {
    content = (
      <div className={stateWrap}>
        <span className={stateTitle}>로그인이 필요해요</span>
        <span className={stateBody}>앱에서 로그인하면 이야기를 볼 수 있어요.</span>
      </div>
    );
  } else if (
    typeof window === "undefined" &&
    queryClient.getQueryData(COMMUNITY_POSTS_QUERY_KEY) === undefined
  ) {
    content = <LoadingState />;
  } else {
    content = (
      <ErrorBoundary
        fallback={(reset) => (
          <div className={stateWrap}>
            <span className={stateTitle}>목록을 불러오지 못했어요</span>
            <button
              className={retryButton}
              onClick={() => {
                void queryClient.resetQueries({
                  queryKey: COMMUNITY_POSTS_QUERY_KEY,
                });
                reset();
              }}
              type="button"
            >
              다시 시도
            </button>
          </div>
        )}
      >
        <Suspense fallback={<LoadingState />}>
          <PostList />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <main className={page}>
      {content}
      <button aria-label="글쓰기" className={writeFab} onClick={openWrite} type="button">
        +
      </button>
    </main>
  );
};

export default CommunityPage;
