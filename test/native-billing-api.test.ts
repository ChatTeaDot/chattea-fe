import { ApolloLink, Observable } from "@apollo/client";
import { print } from "graphql";
import { describe, expect, it } from "vitest";

import {
  CONSUMABLE_BALANCE_QUERY,
  CURRENT_SUBSCRIPTION_QUERY,
  refreshBackendBillingState,
} from "../src/features/native/billing/api";
import { createApolloClient } from "../src/shared/graphql/client";

describe("native billing API", () => {
  it("queries the server-authoritative active boost boundary", () => {
    expect(print(CONSUMABLE_BALANCE_QUERY)).toContain("activeBoostUntil");
  });

  it("refreshes billing state over the network without active query observers", async () => {
    const operations: string[] = [];
    const client = createApolloClient(
      new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            operations.push(operation.operationName ?? "");
            observer.next({
              data:
                operation.operationName === "NativeConsumableBalance"
                  ? {
                      consumableBalance: {
                        activeBoostUntil: "2099-08-28T01:00:00.000Z",
                        boostCredits: 4,
                        superLikeCredits: 7,
                      },
                    }
                  : { currentSubscription: { planId: "gold" } },
            });
            observer.complete();
          }),
      ),
    );

    await expect(refreshBackendBillingState(client)).resolves.toEqual({
      boostCredits: 4,
      planId: "gold",
      superLikeCredits: 7,
    });

    expect(operations).toEqual(["NativeConsumableBalance", "NativeCurrentSubscription"]);
    expect(client.readQuery({ query: CONSUMABLE_BALANCE_QUERY })).toEqual({
      consumableBalance: {
        activeBoostUntil: "2099-08-28T01:00:00.000Z",
        boostCredits: 4,
        superLikeCredits: 7,
      },
    });
    expect(client.readQuery({ query: CURRENT_SUBSCRIPTION_QUERY })).toEqual({
      currentSubscription: { planId: "gold" },
    });
  });
});
