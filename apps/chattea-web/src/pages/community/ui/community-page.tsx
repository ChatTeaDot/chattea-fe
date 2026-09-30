import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";

import { useTranslation } from "@/i18n";
import { ANALYTICS_EVENT, ANALYTICS_SCREEN, track } from "@/shared/analytics";
import { ErrorBoundary } from "@/shared/lib";

import { COMMUNITY_POSTS_QUERY_KEY } from "../api";
import { openWrite } from "../bridge";
import {
  page,
  retryButton,
  srOnly,
  stateBody,
  stateTitle,
  stateWrap,
  writeFab,
} from "./community-page.css";
import PostList from "./post-list";

const hasAuthToken = () =>
  typeof window !== "undefined" && Boolean(window.__CHATTEA_AUTH__?.authorization);

const signedOut = () => typeof window !== "undefined" && !hasAuthToken();

const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className={stateWrap} role="status">
      <span className={stateBody}>{t("states.loading")}</span>
    </div>
  );
};

const CommunityPage = () => {
  const { t } = useTranslation("community");
  const queryClient = useQueryClient();

  useEffect(() => {
    track(ANALYTICS_EVENT.communityView, {
      screen: ANALYTICS_SCREEN.community,
      source: "webview",
    });
  }, []);

  let content;
  if (signedOut()) {
    content = (
      <div className={stateWrap}>
        <span className={stateTitle}>{t("signedOut.title")}</span>
        <span className={stateBody}>{t("signedOut.body")}</span>
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
          <div className={stateWrap} role="alert">
            <span className={stateTitle}>{t("loadError.title")}</span>
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
              {t("common:actions.retry")}
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
      <h1 className={srOnly}>{t("title")}</h1>
      {content}
      <button aria-label={t("write")} className={writeFab} onClick={openWrite} type="button">
        +
      </button>
    </main>
  );
};

export default CommunityPage;
