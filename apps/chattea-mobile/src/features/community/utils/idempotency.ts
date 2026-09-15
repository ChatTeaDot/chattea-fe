import { randomUUID } from "expo-crypto";

import type { CommunityCommentDraft, CommunityPostDraft, KeyFactory } from "../types";

export const createCommunityPostDraft = (
  createKey: KeyFactory = randomUUID,
): CommunityPostDraft => ({
  body: "",
  idempotencyKey: createKey(),
  title: "",
});

export const updateCommunityPostDraft = (
  current: CommunityPostDraft,
  patch: Partial<Pick<CommunityPostDraft, "body" | "title">>,
  createKey: KeyFactory = randomUUID,
): CommunityPostDraft => {
  const body = patch.body ?? current.body;
  const title = patch.title ?? current.title;
  const payloadChanged =
    body.trim() !== current.body.trim() || title.trim() !== current.title.trim();
  return {
    body,
    idempotencyKey: payloadChanged ? createKey() : current.idempotencyKey,
    title,
  };
};

export const toCreateCommunityPostVariables = (draft: CommunityPostDraft) => ({
  input: {
    idempotencyKey: draft.idempotencyKey,
    title: draft.title.trim(),
    body: draft.body.trim(),
  },
});

export const createCommunityCommentDraft = (
  createKey: KeyFactory = randomUUID,
): CommunityCommentDraft => ({
  body: "",
  idempotencyKey: createKey(),
});

export const updateCommunityCommentDraft = (
  current: CommunityCommentDraft,
  body: string,
  createKey: KeyFactory = randomUUID,
): CommunityCommentDraft => ({
  body,
  idempotencyKey: body.trim() === current.body.trim() ? current.idempotencyKey : createKey(),
});

export const toCreateCommunityCommentVariables = (
  postId: string,
  draft: CommunityCommentDraft,
) => ({
  input: {
    idempotencyKey: draft.idempotencyKey,
    postId,
    body: draft.body.trim(),
  },
});
