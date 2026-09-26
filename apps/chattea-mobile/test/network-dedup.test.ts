import { ApolloClient, ApolloLink, gql, InMemoryCache, Observable } from "@apollo/client";
import { RefetchEventManager } from "@apollo/client/core";
import { describe, expect, it, vi } from "vitest";

import { createApolloClient } from "../src/shared/graphql/client";

const VIEWER_QUERY = gql`
  query ViewerForDedup {
    viewer {
      id
    }
  }
`;

const createCountingLink = () => {
  let count = 0;
  const link = new ApolloLink((_operation, _forward) =>
    new Observable((observer) => {
      count += 1;
      observer.next({ data: { viewer: { id: "viewer-1" } } });
      observer.complete();
    }),
  );
  return { count: () => count, link };
};

const createFocusManager = () =>
  new RefetchEventManager({
    sources: { windowFocus: true },
    defaultHandler: ({ client, matchesRefetchOn }) => {
      void client.refetchQueries({ include: "active", onQueryUpdated: matchesRefetchOn });
    },
  });

const runNavigationSequence = async (
  client: ApolloClient,
  manager: RefetchEventManager,
  count: () => number,
) => {
  const observable = client.watchQuery({ fetchPolicy: "cache-first", query: VIEWER_QUERY });
  let resolveInitial: () => void = () => undefined;
  const initial = new Promise<void>((resolve) => {
    resolveInitial = resolve;
  });
  const subscription = observable.subscribe({ next: () => resolveInitial() });
  await initial;
  const focusEvent = new Event("focus");
  manager.emit("windowFocus", focusEvent);
  manager.emit("windowFocus", focusEvent);
  await vi.waitFor(() => expect(count()).toBeGreaterThanOrEqual(1));
  subscription.unsubscribe();
};

describe("network deduplication", () => {
  it("reduces window focus refetches with default options", async () => {
    const { count: legacyCount, link: legacyLink } = createCountingLink();
    const legacyManager = createFocusManager();
    const legacyClient = new ApolloClient({
      cache: new InMemoryCache(),
      defaultOptions: { watchQuery: { fetchPolicy: "cache-first" } },
      link: legacyLink,
      refetchEventManager: legacyManager,
    });

    const { count: fixedCount, link: fixedLink } = createCountingLink();
    const fixedManager = createFocusManager();
    const fixedClient = createApolloClient(fixedLink);
    fixedManager.connect(fixedClient);

    await runNavigationSequence(legacyClient, legacyManager, legacyCount);
    await runNavigationSequence(fixedClient, fixedManager, fixedCount);

    await vi.waitFor(() => expect(legacyCount()).toBe(3));
    expect(fixedCount()).toBe(1);
    expect(fixedCount()).toBeLessThan(legacyCount());
  });
});
