import { useQuery } from "@tanstack/react-query";

import { communityPostsQuery } from "../api";
import { openWrite } from "../bridge";

import {
  list,
  page,
  retryButton,
  stateBody,
  stateTitle,
  stateWrap,
  writeFab,
} from "./community-page.css";
import PostRow from "./post-row";

const hasAuthToken = () =>
  typeof window !== "undefined" && Boolean(window.__CHATTEA_AUTH__?.authorization);

const CommunityPage = () => {
  const posts = useQuery({ ...communityPostsQuery(), enabled: hasAuthToken() });

  let content;
  if (!hasAuthToken()) {
    content = (
      <div className={stateWrap}>
        <span className={stateTitle}>로그인이 필요해요</span>
        <span className={stateBody}>앱에서 로그인하면 이야기를 볼 수 있어요.</span>
      </div>
    );
  } else if (posts.isPending) {
    content = (
      <div className={stateWrap}>
        <span className={stateBody}>불러오는 중…</span>
      </div>
    );
  } else if (posts.isError) {
    content = (
      <div className={stateWrap}>
        <span className={stateTitle}>목록을 불러오지 못했어요</span>
        <button className={retryButton} onClick={() => void posts.refetch()} type="button">
          다시 시도
        </button>
      </div>
    );
  } else if (posts.data.length === 0) {
    content = (
      <div className={stateWrap}>
        <span className={stateTitle}>아직 글이 없어요</span>
        <span className={stateBody}>첫 이야기를 남겨 보세요.</span>
      </div>
    );
  } else {
    content = (
      <ul className={list}>
        {posts.data.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </ul>
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
