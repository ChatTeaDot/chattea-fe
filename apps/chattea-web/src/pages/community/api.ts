import { queryOptions } from "@tanstack/react-query";

import { COMMUNITY_TITLE } from "@/shared/config/constants";

export const communityTitleQuery = () =>
  queryOptions({
    queryKey: ["community", "title"],
    queryFn: () => Promise.resolve(COMMUNITY_TITLE),
  });
