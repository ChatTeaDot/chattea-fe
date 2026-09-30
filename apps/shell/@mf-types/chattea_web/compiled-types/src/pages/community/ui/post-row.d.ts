import type { CommunityPost } from "../types";
type PostRowProps = {
    post: CommunityPost;
};
declare const PostRow: ({ post }: PostRowProps) => import("react").JSX.Element;
export default PostRow;
