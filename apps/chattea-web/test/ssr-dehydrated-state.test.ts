import { dehydrate, QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { dehydratedStateScript, injectDehydratedState } from "@/app/ssr/dehydrated-state";

const POST = {
  authorName: "모모",
  body: "본문",
  commentCount: 3,
  createdAt: "2026-09-22T01:00:00.000Z",
  id: "post-1",
  title: "첫 글",
};

const primedState = (data: unknown) => {
  const client = new QueryClient();
  client.setQueryData(["community", "posts"], data);
  return dehydrate(client);
};

describe("dehydratedStateScript", () => {
  it("serializes dehydrated state into a window assignment script", () => {
    const script = dehydratedStateScript(primedState([POST]));

    expect(script).toContain("<script>window.__DEHYDRATED__=");
    expect(script).toContain("</script>");
    expect(script).toContain('"community"');
    expect(script).toContain("post-1");
  });

  it("escapes < so payloads cannot break out of the script tag", () => {
    const script = dehydratedStateScript(
      primedState([{ ...POST, title: "</script><img src=x onerror=alert(1)>" }]),
    );

    expect(script).not.toContain("</script><img");
    expect(script).toContain("\\u003c/script>");
  });

  it("returns empty string when there is nothing to hydrate", () => {
    expect(dehydratedStateScript(dehydrate(new QueryClient()))).toBe("");
    expect(dehydratedStateScript(undefined)).toBe("");
    expect(dehydratedStateScript(null)).toBe("");
  });
});

describe("injectDehydratedState", () => {
  it("inserts the script before </body>", () => {
    const tail = `</div><script type="module" src="/src/app/entry.tsx"></script></body></html>`;

    const html = injectDehydratedState(tail, primedState([POST]));

    const scriptAt = html.indexOf("window.__DEHYDRATED__");
    expect(scriptAt).toBeGreaterThan(-1);
    expect(scriptAt).toBeLessThan(html.indexOf("</body>"));
    expect(html).toContain("</body></html>");
  });

  it("leaves the tail untouched when state is empty", () => {
    const tail = "</div></body></html>";

    expect(injectDehydratedState(tail, undefined)).toBe(tail);
  });
});
