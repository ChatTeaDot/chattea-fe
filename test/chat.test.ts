import { describe, expect, it } from "vitest";
import {
  blockUser,
  createCommunityComment,
  createCommunityPost,
  createUpload,
  deleteMessage,
  editMessage,
  getUnreadMessageSummary,
  getMySubscription,
  likeUser,
  listBlackMatchCandidates,
  listLikedMeCandidates,
  listCommunityPosts,
  listMatchCandidates,
  listMessages,
  listRooms,
  listSubscriptionPlans,
  markRoomRead,
  rateProfile,
  reportCommunityPost,
  reportMessage,
  sendMessage,
  setTyping,
  setUploadFetcher,
  subscribeToMessageCreated,
  subscribeToMessageDeleted,
  subscribeToMessageUpdated,
  subscribeToReadReceiptUpdated,
  subscribeToTypingChanged,
  uploadFileToSignedUrl,
} from "../src/features/chat/api";
import {
  setGraphQLRequester,
  setGraphQLSubscriptionClientFactory,
} from "../src/shared/graphql/client";
import {
  FIRST_MESSAGE_MAX_LENGTH,
  getMessageTextLimit,
  MESSAGE_MAX_LENGTH,
  normalizeMessageDraft,
} from "../src/features/chat/message-limits";

describe("chat api", () => {
  it("uses product text limits for first and general messages", () => {
    expect(getMessageTextLimit(false)).toBe(FIRST_MESSAGE_MAX_LENGTH);
    expect(getMessageTextLimit(true)).toBe(MESSAGE_MAX_LENGTH);
    expect(normalizeMessageDraft(` ${"a".repeat(40)} `, FIRST_MESSAGE_MAX_LENGTH)).toHaveLength(
      FIRST_MESSAGE_MAX_LENGTH,
    );
  });

  it("uses backend GraphQL rooms, messages, and message mutations", async () => {
    const calls: { query: string; variables?: Record<string, unknown> }[] = [];
    setGraphQLRequester(async <T>(query: string, variables?: Record<string, unknown>) => {
      calls.push({ query, variables });

      if (query.includes("query Rooms")) {
        return { rooms: [{ id: "demo-room", name: "오늘의 대화", lastMessage: "hi" }] } as T;
      }

      if (query.includes("query Messages")) {
        return {
          messages: [
            {
              id: "message-1",
              roomId: "demo-room",
              text: "hi",
              createdAt: "2026-06-25T00:00:00.000Z",
            },
          ],
        } as T;
      }

      if (query.includes("query CommunityPosts")) {
        return {
          communityPosts: [
            {
              id: "post-1",
              anonymousNickname: "익명1",
              title: "연애 상담",
              body: "첫 대화가 어려워요",
              commentCount: 0,
              createdAt: "2026-06-25T00:00:00.000Z",
            },
          ],
        } as T;
      }

      if (query.includes("query MatchCandidates")) {
        return {
          matchCandidates: [
            {
              id: "match-user",
              nickname: "차한잔",
              intro: "천천히 대화해요",
              likedByMe: false,
              planId: "black",
              blackRecommended: true,
            },
          ],
        } as T;
      }

      if (query.includes("query BlackMatchCandidates")) {
        return {
          blackMatchCandidates: [
            {
              id: "match-user",
              nickname: "차한잔",
              intro: "천천히 대화해요",
              likedByMe: false,
              planId: "black",
              blackRecommended: true,
            },
          ],
        } as T;
      }

      if (query.includes("query LikedMeCandidates")) {
        return {
          likedMeCandidates: [
            {
              id: "liked-me-user",
              nickname: "누군가",
              intro: "반갑습니다",
              likedByMe: false,
              planId: "basic",
              blackRecommended: false,
            },
          ],
        } as T;
      }

      if (query.includes("query SubscriptionPlans")) {
        return {
          subscriptionPlans: [
            { id: "free", name: "Free", monthlyPriceKrw: 0, benefits: ["기본 매칭"] },
            { id: "basic", name: "Basic", monthlyPriceKrw: 4900, benefits: ["좋아요 증가"] },
            { id: "gold", name: "Gold", monthlyPriceKrw: 9900, benefits: ["우선 추천"] },
            { id: "black", name: "Black", monthlyPriceKrw: 24900, benefits: ["Black 전용 추천"] },
          ],
        } as T;
      }

      if (query.includes("query MySubscription")) {
        return { mySubscription: { planId: "black" } } as T;
      }

      if (query.includes("query UnreadMessageSummary")) {
        return {
          unreadMessageSummary: {
            available: true,
            reason: null,
            sourceText: "오늘 대화가 길어져서 안읽은 메시지 요약을 보여줄 수 있습니다.",
            summary:
              "최근 안읽은 대화 요약: 오늘 대화가 길어져서 안읽은 메시지 요약을 보여줄 수 있습니다.",
          },
        } as T;
      }

      if (query.includes("mutation EditMessage")) {
        return {
          editMessage: {
            id: "server-message",
            roomId: "demo-room",
            text: "edited",
            createdAt: "2026-06-25T00:00:02.000Z",
          },
        } as T;
      }

      if (query.includes("mutation DeleteMessage")) {
        return { deleteMessage: true } as T;
      }

      if (query.includes("mutation CreateCommunityPost")) {
        return {
          createCommunityPost: {
            id: "post-1",
            anonymousNickname: "익명1",
            title: variables?.title,
            body: variables?.body,
            commentCount: 0,
            createdAt: "2026-06-25T00:00:00.000Z",
          },
        } as T;
      }

      if (query.includes("mutation CreateCommunityComment")) {
        return {
          createCommunityComment: {
            id: "comment-1",
            postId: variables?.postId,
            anonymousNickname: "익명2",
            body: variables?.body,
            createdAt: "2026-06-25T00:00:01.000Z",
          },
        } as T;
      }

      if (query.includes("mutation MarkRoomRead")) {
        return { markRoomRead: true } as T;
      }

      if (query.includes("mutation SetTyping")) {
        return { setTyping: true } as T;
      }

      if (query.includes("mutation LikeUser")) {
        return { likeUser: { matched: true, roomId: "room-1" } } as T;
      }

      if (query.includes("mutation RateProfile")) {
        return { rateProfile: { userId: variables?.userId, averageScore: 5, ratingCount: 1 } } as T;
      }

      if (query.includes("mutation BlockUser")) {
        return { blockUser: true } as T;
      }

      if (query.includes("mutation ReportMessage")) {
        return { reportMessage: true } as T;
      }

      if (query.includes("mutation ReportCommunityPost")) {
        return { reportCommunityPost: true } as T;
      }

      return {
        sendMessage: {
          id: "server-message",
          roomId: "demo-room",
          text: "hello",
          createdAt: "2026-06-25T00:00:01.000Z",
        },
        createUpload: { id: "upload-id", putUrl: "https://uploads.invalid/upload-id" },
      } as T;
    });

    await expect(listRooms()).resolves.toEqual([
      { id: "demo-room", name: "오늘의 대화", lastMessage: "hi" },
    ]);
    await expect(listMessages("demo-room")).resolves.toEqual([
      {
        id: "message-1",
        roomId: "demo-room",
        text: "hi",
        createdAt: "2026-06-25T00:00:00.000Z",
        status: "sent",
        mine: false,
      },
    ]);
    await expect(listMessages("demo-room", { first: 10, after: "message-1" })).resolves.toEqual([
      {
        id: "message-1",
        roomId: "demo-room",
        text: "hi",
        createdAt: "2026-06-25T00:00:00.000Z",
        status: "sent",
        mine: false,
      },
    ]);
    await expect(
      sendMessage({ roomId: "demo-room", text: "hello", idempotencyKey: "temp-1" }),
    ).resolves.toMatchObject({
      id: "server-message",
      status: "sent",
      mine: true,
    });
    await expect(listMatchCandidates()).resolves.toEqual([
      {
        id: "match-user",
        nickname: "차한잔",
        intro: "천천히 대화해요",
        likedByMe: false,
        planId: "black",
        blackRecommended: true,
      },
    ]);
    await expect(listBlackMatchCandidates()).resolves.toEqual([
      {
        id: "match-user",
        nickname: "차한잔",
        intro: "천천히 대화해요",
        likedByMe: false,
        planId: "black",
        blackRecommended: true,
      },
    ]);
    await expect(listLikedMeCandidates()).resolves.toEqual([
      {
        id: "liked-me-user",
        nickname: "누군가",
        intro: "반갑습니다",
        likedByMe: false,
        planId: "basic",
        blackRecommended: false,
      },
    ]);
    await expect(likeUser("match-user")).resolves.toEqual({ matched: true, roomId: "room-1" });
    await expect(rateProfile({ userId: "match-user", score: 5 })).resolves.toEqual({
      userId: "match-user",
      averageScore: 5,
      ratingCount: 1,
    });
    await expect(listCommunityPosts()).resolves.toEqual([
      {
        id: "post-1",
        anonymousNickname: "익명1",
        title: "연애 상담",
        body: "첫 대화가 어려워요",
        commentCount: 0,
        createdAt: "2026-06-25T00:00:00.000Z",
      },
    ]);
    await expect(
      createCommunityPost({ title: "연애 상담", body: "첫 대화가 어려워요" }),
    ).resolves.toMatchObject({
      anonymousNickname: "익명1",
      title: "연애 상담",
    });
    await expect(
      createCommunityComment({ postId: "post-1", body: "공감해요" }),
    ).resolves.toMatchObject({
      postId: "post-1",
      body: "공감해요",
    });
    await expect(reportCommunityPost({ postId: "post-1", reason: "사용자 신고" })).resolves.toBe(
      true,
    );
    await expect(listSubscriptionPlans()).resolves.toEqual([
      { id: "free", name: "Free", monthlyPriceKrw: 0, benefits: ["기본 매칭"] },
      { id: "basic", name: "Basic", monthlyPriceKrw: 4900, benefits: ["좋아요 증가"] },
      { id: "gold", name: "Gold", monthlyPriceKrw: 9900, benefits: ["우선 추천"] },
      { id: "black", name: "Black", monthlyPriceKrw: 24900, benefits: ["Black 전용 추천"] },
    ]);
    await expect(getMySubscription()).resolves.toEqual({ planId: "black" });
    await expect(
      getUnreadMessageSummary({
        planId: "gold",
        unreadTexts: ["오늘 대화가 길어져서 안읽은 메시지 요약을 보여줄 수 있습니다."],
        enabled: true,
      }),
    ).resolves.toMatchObject({ available: true, reason: null });
    await expect(
      editMessage({ messageId: "server-message", text: "edited" }),
    ).resolves.toMatchObject({
      id: "server-message",
      text: "edited",
      status: "sent",
      mine: true,
    });
    await expect(deleteMessage("server-message")).resolves.toBe(true);
    await expect(markRoomRead("demo-room")).resolves.toBe(true);
    await expect(setTyping({ roomId: "demo-room", typing: true })).resolves.toBe(true);
    await expect(blockUser("blocked-user")).resolves.toBe(true);
    await expect(
      reportMessage({ messageId: "server-message", reason: "사용자 신고" }),
    ).resolves.toBe(true);
    await expect(
      createUpload({ filename: "photo.jpg", contentType: "image/jpeg" }),
    ).resolves.toEqual({
      id: "upload-id",
      putUrl: "https://uploads.invalid/upload-id",
    });

    expect(calls.map((call) => call.variables)).toEqual([
      undefined,
      { roomId: "demo-room", first: 50, after: null },
      { roomId: "demo-room", first: 10, after: "message-1" },
      { roomId: "demo-room", text: "hello", idempotencyKey: "temp-1" },
      undefined,
      undefined,
      undefined,
      { userId: "match-user" },
      { userId: "match-user", score: 5 },
      undefined,
      { title: "연애 상담", body: "첫 대화가 어려워요" },
      { postId: "post-1", body: "공감해요" },
      { postId: "post-1", reason: "사용자 신고" },
      undefined,
      undefined,
      {
        planId: "gold",
        unreadTexts: ["오늘 대화가 길어져서 안읽은 메시지 요약을 보여줄 수 있습니다."],
        enabled: true,
      },
      { messageId: "server-message", text: "edited" },
      { messageId: "server-message" },
      { roomId: "demo-room" },
      { roomId: "demo-room", typing: true },
      { userId: "blocked-user" },
      { messageId: "server-message", reason: "사용자 신고" },
      { filename: "photo.jpg", contentType: "image/jpeg" },
    ]);
  });

  it("maps messageCreated subscription payloads into chat messages", () => {
    setGraphQLSubscriptionClientFactory(() => ({
      subscribe(_payload, sink) {
        sink.next({
          data: {
            messageCreated: {
              id: "message-2",
              roomId: "demo-room",
              text: "new",
              createdAt: "2026-06-25T00:00:02.000Z",
            },
          },
        } as never);
        return () => undefined;
      },
    }));

    const messages: unknown[] = [];
    const dispose = subscribeToMessageCreated({
      roomId: "demo-room",
      onMessage(message) {
        messages.push(message);
      },
    });

    expect(messages).toEqual([
      {
        id: "message-2",
        roomId: "demo-room",
        text: "new",
        createdAt: "2026-06-25T00:00:02.000Z",
        status: "sent",
        mine: false,
      },
    ]);
    dispose();
  });

  it("maps messageUpdated and messageDeleted subscription payloads", () => {
    setGraphQLSubscriptionClientFactory(() => ({
      subscribe(payload, sink) {
        if (payload.query.includes("MessageUpdated")) {
          sink.next({
            data: {
              messageUpdated: {
                id: "message-2",
                roomId: "demo-room",
                text: "edited",
                createdAt: "2026-06-25T00:00:02.000Z",
              },
            },
          } as never);
        }

        if (payload.query.includes("MessageDeleted")) {
          sink.next({ data: { messageDeleted: "message-2" } } as never);
        }

        return () => undefined;
      },
    }));

    const updated: unknown[] = [];
    const deleted: string[] = [];
    const disposeUpdated = subscribeToMessageUpdated({
      roomId: "demo-room",
      onMessage(message) {
        updated.push(message);
      },
    });
    const disposeDeleted = subscribeToMessageDeleted({
      roomId: "demo-room",
      onMessageId(messageId) {
        deleted.push(messageId);
      },
    });

    expect(updated).toEqual([
      {
        id: "message-2",
        roomId: "demo-room",
        text: "edited",
        createdAt: "2026-06-25T00:00:02.000Z",
        status: "sent",
        mine: false,
      },
    ]);
    expect(deleted).toEqual(["message-2"]);
    disposeUpdated();
    disposeDeleted();
  });

  it("maps typing and read receipt subscription payloads", () => {
    setGraphQLSubscriptionClientFactory(() => ({
      subscribe(payload, sink) {
        if (payload.query.includes("TypingChanged")) {
          sink.next({ data: { typingChanged: true } } as never);
        }

        if (payload.query.includes("ReadReceiptUpdated")) {
          sink.next({ data: { readReceiptUpdated: true } } as never);
        }

        return () => undefined;
      },
    }));

    const typingEvents: boolean[] = [];
    const readEvents: boolean[] = [];
    const disposeTyping = subscribeToTypingChanged({
      roomId: "demo-room",
      onTyping(typing) {
        typingEvents.push(typing);
      },
    });
    const disposeRead = subscribeToReadReceiptUpdated({
      roomId: "demo-room",
      onRead(read) {
        readEvents.push(read);
      },
    });

    expect(typingEvents).toEqual([true]);
    expect(readEvents).toEqual([true]);
    disposeTyping();
    disposeRead();
  });

  it("puts attachment bytes to signed upload URL", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    setUploadFetcher(async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return new Response(null, { status: 200 });
    });

    await expect(
      uploadFileToSignedUrl({
        putUrl: "https://uploads.invalid/upload-id",
        contentType: "image/jpeg",
        body: "bytes",
      }),
    ).resolves.toBeUndefined();

    expect(calls[0]!.url).toBe("https://uploads.invalid/upload-id");
    expect(calls[0]!.init.method).toBe("PUT");
    expect((calls[0]!.init.headers as Record<string, string>)["content-type"]).toBe("image/jpeg");
    expect(calls[0]!.init.body).toBe("bytes");
  });

  it("fails closed when attachment upload PUT fails", async () => {
    setUploadFetcher(async () => new Response(null, { status: 500 }));

    await expect(
      uploadFileToSignedUrl({
        putUrl: "https://uploads.invalid/upload-id",
        contentType: "image/jpeg",
        body: "bytes",
      }),
    ).rejects.toThrow("UPLOAD_PUT_FAILED");
  });
});
