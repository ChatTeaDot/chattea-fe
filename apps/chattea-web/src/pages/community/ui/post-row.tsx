import { useCallback } from "react";

import { formatRelativeDate } from "@/shared/lib";

import { openPost } from "../bridge";
import type { CommunityPost } from "../types";

import { rowBody, rowButton, rowSub, rowTitle } from "./community-page.css";

type PostRowProps = { post: CommunityPost };

const PostRow = ({ post }: PostRowProps) => {
  const open = useCallback(() => openPost(post.id), [post.id]);
  return (
    <li>
      <button className={rowButton} onClick={open} type="button">
        <span className={rowBody}>
          <span className={rowTitle}>{post.title}</span>
          <span className={rowSub}>
            {`${post.authorName} · 댓글 ${post.commentCount} · ${formatRelativeDate(post.createdAt)}`}
          </span>
        </span>
      </button>
    </li>
  );
};

export default PostRow;
