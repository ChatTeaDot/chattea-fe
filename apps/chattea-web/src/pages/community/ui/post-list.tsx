import { useSuspenseQuery } from "@tanstack/react-query";

import { communityPostsQuery } from "../api";

import { list, stateBody, stateTitle, stateWrap } from "./community-page.css";
import PostRow from "./post-row";

const PostList = () => {
  const { data: posts } = useSuspenseQuery(communityPostsQuery());

  if (posts.length === 0) {
    return (
      <div className={stateWrap}>
        <span className={stateTitle}>아직 글이 없어요</span>
        <span className={stateBody}>첫 이야기를 남겨 보세요.</span>
      </div>
    );
  }

  return (
    <ul className={list}>
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </ul>
  );
};

export default PostList;
