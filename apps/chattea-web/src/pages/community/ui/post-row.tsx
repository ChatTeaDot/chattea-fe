import { UnstyledButton } from "@mantine/core";
import { useCallback } from "react";

import { useTranslation } from "@/i18n";
import { formatRelativeDate } from "@/shared/lib";

import { openPost } from "../bridge";
import type { CommunityPost } from "../types";
import { rowBody, rowButton, rowSub, rowTitle } from "./community-page.css";

type PostRowProps = { post: CommunityPost };

const PostRow = ({ post }: PostRowProps) => {
  const { t, i18n } = useTranslation("community");
  const open = useCallback(() => openPost(post.id), [post.id]);
  return (
    <li>
      <UnstyledButton className={rowButton} onClick={open}>
        <span className={rowBody}>
          <span className={rowTitle}>{post.title}</span>
          <span className={rowSub}>
            {`${post.authorName} · ${t("commentCount", { count: post.commentCount })} · ${formatRelativeDate(post.createdAt, i18n.language)}`}
          </span>
        </span>
      </UnstyledButton>
    </li>
  );
};

export default PostRow;
