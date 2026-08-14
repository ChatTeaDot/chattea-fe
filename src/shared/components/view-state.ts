export type ContentViewState = "loading" | "error" | "empty" | "content";

export const getContentViewState = (
  loading: boolean,
  hasError: boolean,
  count: number,
): ContentViewState => {
  if (loading) return "loading";
  if (hasError) return "error";
  if (count === 0) return "empty";
  return "content";
};
