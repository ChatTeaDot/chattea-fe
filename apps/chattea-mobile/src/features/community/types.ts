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

export type PostDetailCardProps = { post: CommunityPost; reportPost: () => void };
