import type { COMMUNITY_CATEGORIES, COMMUNITY_FILTERS } from "./constants";

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export type CommunityFilter = (typeof COMMUNITY_FILTERS)[number];

export type CommunityPost = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  commentCount: number;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type PostsData = { communityPosts: CommunityPost[] };

export type CommentsData = { communityComments: CommunityComment[] };

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

export type PostRowProps = Omit<CommunityPost, "id"> & {
  id: string;
  onOpen: (id: string) => void;
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

export type WriteFabProps = { onPress: () => void };
