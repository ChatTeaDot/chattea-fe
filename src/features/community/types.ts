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

export type CommunityProfile = {
  name: string;
};
