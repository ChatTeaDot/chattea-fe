import { queryOptions } from "@tanstack/react-query";

import { COMMUNITY_TITLE } from "@/shared/config/constants";

const slowQueryMs = () =>
  typeof window === "undefined" ? Number(process.env.SLOW_QUERY_MS ?? 0) : 0;

export const communityTitleQuery = () =>
  queryOptions({
    queryKey: ["community", "title"],
    queryFn: async () => {
      const ms = slowQueryMs();
      if (ms > 0) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
      return COMMUNITY_TITLE;
    },
  });
