import type { CommunityPost } from "./api/schemas";
import type { COMMUNITY_CATEGORIES } from "./constants";

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export type KeyFactory = () => string;

export type CommunityPostDraft = {
  body: string;
  idempotencyKey: string;
  title: string;
};

export type CommunityCommentDraft = {
  body: string;
  idempotencyKey: string;
};

export type CommentRowProps = {
  authorName: string;
  body: string;
  createdAt: string;
  id: string;
  onReport: (id: string) => void;
};

export type PostDetailCardProps = { post: CommunityPost };

export type ChipRowProps<ItemT extends string> = {
  items: readonly ItemT[];
  onSelect: (item: ItemT) => void;
  selected: ItemT;
};

export type CommentInputBarProps = {
  disabled: boolean;
  onChangeBody: (body: string) => void;
  onSubmit: () => void;
  value: string;
};
