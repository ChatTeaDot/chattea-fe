import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client";
import { print } from "graphql";
import { describe, expect, it } from "vitest";

import {
  COMMUNITY_POSTS_QUERY,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  CREATE_COMMUNITY_POST_MUTATION,
  UPDATE_COMMUNITY_PROFILE_MUTATION,
  UPDATE_COMMUNITY_PROFILE_OPTIONS,
  updateCommunityPostList,
} from "../src/features/community/api";
import { LIKED_ME_CANDIDATES_QUERY } from "../src/features/likes/api";
import {
  BLACK_MATCH_CANDIDATES_QUERY,
  LIKE_USER_MUTATION,
  MATCH_CANDIDATES_QUERY,
  updateLikedCandidate,
} from "../src/features/match/api";

describe("Apollo feature operations", () => {
  it("explicitly selects typenames for normalized community entities", () => {
    expect(print(COMMUNITY_POSTS_QUERY)).toMatch(/communityPosts \{\s+__typename\s+id/);
    expect(print(CREATE_COMMUNITY_POST_MUTATION)).toMatch(
      /createCommunityPost\(input: \$input\) \{\s+__typename\s+id/,
    );
    expect(print(CREATE_COMMUNITY_COMMENT_MUTATION)).toMatch(
      /createCommunityComment\(input: \$input\) \{\s+__typename\s+id/,
    );
  });

  it("explicitly selects typenames for every normalized candidate list", () => {
    expect(print(MATCH_CANDIDATES_QUERY)).toMatch(/matchCandidates \{\s+__typename\s+id/);
    expect(print(BLACK_MATCH_CANDIDATES_QUERY)).toMatch(
      /blackMatchCandidates \{\s+__typename\s+id/,
    );
    expect(print(LIKED_ME_CANDIDATES_QUERY)).toMatch(/likedMeCandidates \{\s+__typename\s+id/);
  });

  it("maps a like mutation variable through Apollo transport", async () => {
    const variables: Record<string, unknown>[] = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink((operation) => {
        variables.push(operation.variables);
        return new Observable((observer) => {
          observer.next({ data: { likeUser: { matched: true, roomId: "room-1" } } });
          observer.complete();
        });
      }),
    });

    const result = await client.mutate({
      mutation: LIKE_USER_MUTATION,
      variables: { userId: "user-2" },
    });

    expect(variables).toEqual([{ userId: "user-2" }]);
    expect(result.data?.likeUser).toEqual({ matched: true, roomId: "room-1" });
  });

  it("adds a created post to the cached community list", async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: COMMUNITY_POSTS_QUERY,
      data: {
        communityPosts: [
          {
            __typename: "CommunityPostPayload",
            id: "post-1",
            authorName: "기존 사용자",
            title: "기존 글",
            body: "기존 내용",
            commentCount: 0,
            createdAt: "2026-08-13T00:00:00.000Z",
          },
        ],
      },
    });
    const client = new ApolloClient({
      cache,
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({
              data: {
                createCommunityPost: {
                  __typename: "CommunityPostPayload",
                  id: "post-2",
                  authorName: "새 사용자",
                  title: "새 글",
                  body: "새 내용",
                  commentCount: 0,
                  createdAt: "2026-08-13T01:00:00.000Z",
                },
              },
            });
            observer.complete();
          }),
      ),
    });

    await client.mutate({
      mutation: CREATE_COMMUNITY_POST_MUTATION,
      variables: { input: { title: "새 글", body: "새 내용" } },
      update: updateCommunityPostList,
    });

    expect(cache.readQuery({ query: COMMUNITY_POSTS_QUERY })).toMatchObject({
      communityPosts: [{ id: "post-2" }, { id: "post-1" }],
    });
  });

  it("marks the liked candidate in every normalized candidate list", async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: MATCH_CANDIDATES_QUERY,
      data: {
        matchCandidates: [
          {
            __typename: "MatchCandidatePayload",
            id: "user-2",
            userName: "후보",
            gender: "female",
            intro: "반가워요",
            likedByMe: false,
            planId: "basic",
            blackRecommended: false,
          },
        ],
      },
    });
    const client = new ApolloClient({
      cache,
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({ data: { likeUser: { matched: false, roomId: null } } });
            observer.complete();
          }),
      ),
    });

    await client.mutate({
      mutation: LIKE_USER_MUTATION,
      variables: { userId: "user-2" },
      update: updateLikedCandidate,
    });

    expect(cache.readQuery({ query: MATCH_CANDIDATES_QUERY })).toMatchObject({
      matchCandidates: [{ id: "user-2", likedByMe: true }],
    });
  });

  it("waits for the profile post refetch and surfaces its failure", async () => {
    let postRequests = 0;
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            if (operation.operationName === "UpdateCommunityProfile") {
              observer.next({ data: { updateCommunityProfile: { name: "새 이름" } } });
              observer.complete();
              return;
            }

            postRequests += 1;
            if (postRequests === 1) {
              observer.next({ data: { communityPosts: [] } });
              observer.complete();
              return;
            }

            observer.error(new Error("refetch failed"));
          }),
      ),
    });
    const watchedPosts = client.watchQuery({
      fetchPolicy: "network-only",
      query: COMMUNITY_POSTS_QUERY,
    });
    let subscription: ReturnType<typeof watchedPosts.subscribe>;

    await new Promise<void>((resolve, reject) => {
      subscription = watchedPosts.subscribe({
        error: reject,
        next: (result) => {
          if (!result.loading) resolve();
        },
      });
    });

    await expect(
      client.mutate({
        ...UPDATE_COMMUNITY_PROFILE_OPTIONS,
        mutation: UPDATE_COMMUNITY_PROFILE_MUTATION,
        variables: { input: { name: "새 이름" } },
      }),
    ).rejects.toThrow("refetch failed");
    subscription!.unsubscribe();
    expect(postRequests).toBeGreaterThan(1);
  });
});
