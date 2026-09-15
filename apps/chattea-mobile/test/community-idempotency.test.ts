import { describe, expect, it, vi } from "vitest";

import {
  createCommunityCommentDraft,
  createCommunityPostDraft,
  toCreateCommunityCommentVariables,
  toCreateCommunityPostVariables,
  updateCommunityCommentDraft,
  updateCommunityPostDraft,
} from "../src/features/community/utils/idempotency";

vi.mock("expo-crypto", () => ({ randomUUID: vi.fn() }));

const createKeyFactory = () => {
  const keys = [
    "9d4d6a3e-7f57-4fb8-9275-ae94878316eb",
    "70c14549-e588-42e6-bb2d-616e6bb22bb4",
    "d9bba92d-ac5d-4961-9525-b576375176ae",
    "8cc3bb0d-fe7e-46cf-8e3f-220298233233",
  ];
  return () => {
    const key = keys.shift();
    if (!key) throw new Error("TEST_KEY_REQUIRED");
    return key;
  };
};

describe("community mutation idempotency", () => {
  it("keeps a post key for an equivalent payload and sends it with the variables", () => {
    const keyFactory = createKeyFactory();
    let draft = createCommunityPostDraft(keyFactory);
    draft = updateCommunityPostDraft(draft, { title: " 제목 " }, keyFactory);
    draft = updateCommunityPostDraft(draft, { body: " 본문 " }, keyFactory);
    const submittedKey = draft.idempotencyKey;

    const equivalentDraft = updateCommunityPostDraft(
      draft,
      { title: "제목", body: "본문" },
      keyFactory,
    );

    expect(equivalentDraft.idempotencyKey).toBe(submittedKey);
    expect(toCreateCommunityPostVariables(equivalentDraft)).toEqual({
      input: { idempotencyKey: submittedKey, title: "제목", body: "본문" },
    });
    expect(toCreateCommunityPostVariables(equivalentDraft).input.idempotencyKey).toBe(submittedKey);
    expect(createCommunityPostDraft(keyFactory).idempotencyKey).not.toBe(submittedKey);
  });

  it("keeps a comment key for retries and rotates it when the payload changes or succeeds", () => {
    const keyFactory = createKeyFactory();
    let draft = createCommunityCommentDraft(keyFactory);
    draft = updateCommunityCommentDraft(draft, " 댓글 ", keyFactory);
    const submittedKey = draft.idempotencyKey;

    expect(
      toCreateCommunityCommentVariables("821cc06e-7275-49cf-9d8b-a70e65f78240", draft),
    ).toEqual({
      input: {
        idempotencyKey: submittedKey,
        postId: "821cc06e-7275-49cf-9d8b-a70e65f78240",
        body: "댓글",
      },
    });
    expect(updateCommunityCommentDraft(draft, "댓글", keyFactory).idempotencyKey).toBe(
      submittedKey,
    );
    expect(updateCommunityCommentDraft(draft, "다른 댓글", keyFactory).idempotencyKey).not.toBe(
      submittedKey,
    );
    expect(createCommunityCommentDraft(keyFactory).idempotencyKey).not.toBe(submittedKey);
  });
});
