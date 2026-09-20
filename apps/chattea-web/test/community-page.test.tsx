import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { communityTitleQuery } from "@/pages/community";
import CommunityPage from "@/pages/community/ui/community-page";
import { heading } from "@/pages/community/ui/community-page.css.ts";

describe("CommunityPage", () => {
  it("renders the heading from tanstack query with a vanilla-extract class", async () => {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(communityTitleQuery());

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <CommunityPage />
      </QueryClientProvider>,
    );

    expect(typeof heading).toBe("string");
    expect(heading.length).toBeGreaterThan(0);
    expect(html).toContain(heading);
    expect(html).toContain("지금 나누는 이야기");
  });

  it("loads the community title through tanstack query", async () => {
    const queryClient = new QueryClient();

    await expect(queryClient.fetchQuery(communityTitleQuery())).resolves.toBe("지금 나누는 이야기");
  });
});
