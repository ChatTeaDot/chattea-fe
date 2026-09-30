import { useSuspenseQuery } from "@tanstack/react-query";

import { useTranslation } from "@/i18n";

import { communityPostsQuery } from "../api";
import { list, stateBody, stateTitle, stateWrap } from "./community-page.css";
import PostRow from "./post-row";

const PostList = () => {
  const { t } = useTranslation("community");
  const { data: posts } = useSuspenseQuery(communityPostsQuery());

  if (posts.length === 0) {
    return (
      <div className={stateWrap} role="status">
        <span className={stateTitle}>{t("empty.title")}</span>
        <span className={stateBody}>{t("empty.body")}</span>
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
