import { MockLink } from "@apollo/client/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createUpload,
  deleteMessage,
  editMessage,
  getUnreadMessageSummary,
  listMessages,
  listRooms,
  markRoomRead,
  reportMessage,
  sendMessage,
  setTyping,
  setUploadFetcher,
  uploadFileToSignedUrl,
} from "../src/features/chat/api";
import {
  CHAT_MESSAGES_POLL_INTERVAL,
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  CREATE_UPLOAD_MUTATION,
  DELETE_CHAT_MESSAGE_MUTATION,
  EDIT_CHAT_MESSAGE_MUTATION,
  getChatMessagesQueryOptions,
  getChatMessagesVariables,
  MARK_CHAT_ROOM_READ_MUTATION,
  REPORT_CHAT_MESSAGE_MUTATION,
  SEND_CHAT_MESSAGE_MUTATION,
  SET_CHAT_TYPING_MUTATION,
  UNREAD_MESSAGE_SUMMARY_QUERY,
} from "../src/features/chat/operations";
import { apolloClient } from "../src/shared/graphql";

const room = {
  __typename: "ChatRoomPayload" as const,
  id: "demo-room",
  name: "오늘의 대화",
  lastMessage: null,
};

const message = {
  __typename: "ChatMessagePayload" as const,
  id: "message-1",
  roomId: "demo-room",
  text: "hi",
  createdAt: "2026-06-25T00:00:00.000Z",
};

const originalLink = apolloClient.link;

const useMocks = (mocks: ConstructorParameters<typeof MockLink>[0]) => {
  apolloClient.setLink(new MockLink(mocks));
};

beforeEach(async () => {
  await apolloClient.clearStore();
});

afterEach(async () => {
  apolloClient.setLink(originalLink);
  await apolloClient.clearStore();
});

describe("chat Apollo operations", () => {
  it("executes room and message queries through Apollo MockLink", async () => {
    useMocks([
      { request: { query: CHAT_ROOMS_QUERY }, result: { data: { chatRooms: [room] } } },
      {
        request: {
          query: CHAT_MESSAGES_QUERY,
          variables: { input: { roomId: "demo-room", first: 10, after: "cursor-1" } },
        },
        result: { data: { chatMessages: [message] } },
      },
    ]);

    await expect(listRooms()).resolves.toEqual([room]);
    await expect(listMessages("demo-room", { first: 10, after: "cursor-1" })).resolves.toEqual([
      {
        id: "message-1",
        roomId: "demo-room",
        text: "hi",
        createdAt: "2026-06-25T00:00:00.000Z",
        status: "sent",
        mine: false,
      },
    ]);
  });

  it("executes chat mutations with variables and formats sent messages", async () => {
    const sentMessage = { ...message, id: "server-message", text: "hello" };
    const editedMessage = { ...sentMessage, text: "edited" };
    useMocks([
      {
        request: {
          query: SEND_CHAT_MESSAGE_MUTATION,
          variables: {
            input: { roomId: "demo-room", text: "hello", idempotencyKey: "temp-1" },
          },
        },
        result: { data: { sendChatMessage: sentMessage } },
      },
      {
        request: {
          query: EDIT_CHAT_MESSAGE_MUTATION,
          variables: { input: { messageId: "server-message", text: "edited" } },
        },
        result: { data: { editChatMessage: editedMessage } },
      },
      {
        request: {
          query: DELETE_CHAT_MESSAGE_MUTATION,
          variables: { messageId: "server-message" },
        },
        result: { data: { deleteChatMessage: true } },
      },
      {
        request: {
          query: MARK_CHAT_ROOM_READ_MUTATION,
          variables: { input: { roomId: "demo-room" } },
        },
        result: { data: { markChatRoomRead: true } },
      },
      {
        request: {
          query: SET_CHAT_TYPING_MUTATION,
          variables: { input: { roomId: "demo-room", typing: true } },
        },
        result: { data: { setChatTyping: true } },
      },
      {
        request: {
          query: REPORT_CHAT_MESSAGE_MUTATION,
          variables: { input: { messageId: "server-message", reason: "사용자 신고" } },
        },
        result: { data: { reportChatMessage: true } },
      },
      {
        request: {
          query: CREATE_UPLOAD_MUTATION,
          variables: { input: { filename: "photo.jpg", contentType: "image/jpeg" } },
        },
        result: {
          data: {
            createUpload: {
              __typename: "UploadPayload",
              id: "upload-id",
              putUrl: "https://uploads.invalid/upload-id",
            },
          },
        },
      },
      {
        request: {
          query: UNREAD_MESSAGE_SUMMARY_QUERY,
          variables: {
            input: { planId: "gold", unreadTexts: ["긴 대화"], enabled: true },
          },
        },
        result: {
          data: {
            unreadMessageSummary: {
              __typename: "AiSummaryPreviewPayload",
              available: true,
              reason: null,
              sourceText: "긴 대화",
              summary: "요약",
            },
          },
        },
      },
    ]);
    apolloClient.cache.writeQuery({
      query: CHAT_MESSAGES_QUERY,
      variables: getChatMessagesVariables("demo-room"),
      data: {
        chatMessages: [{ ...message, id: "temp-1", text: "hello" }],
      },
    });

    await expect(
      sendMessage({ roomId: "demo-room", text: "hello", idempotencyKey: "temp-1" }),
    ).resolves.toMatchObject({ id: "server-message", status: "sent", mine: true });
    expect(apolloClient.cache.extract()).toMatchObject({
      "ChatMessagePayload:server-message": { text: "hello" },
    });
    await expect(
      editMessage({ messageId: "server-message", text: "edited" }),
    ).resolves.toMatchObject({ text: "edited", status: "sent", mine: true });
    expect(apolloClient.cache.extract()).toMatchObject({
      "ChatMessagePayload:server-message": { text: "edited" },
    });
    await expect(deleteMessage("server-message")).resolves.toBe(true);
    expect(
      "ChatMessagePayload:server-message" in
        (apolloClient.cache.extract() as Record<string, unknown>),
    ).toBe(false);
    await expect(markRoomRead("demo-room")).resolves.toBe(true);
    await expect(setTyping({ roomId: "demo-room", typing: true })).resolves.toBe(true);
    await expect(
      reportMessage({ messageId: "server-message", reason: "사용자 신고" }),
    ).resolves.toBe(true);
    await expect(
      createUpload({ filename: "photo.jpg", contentType: "image/jpeg" }),
    ).resolves.toMatchObject({ id: "upload-id" });
    await expect(
      getUnreadMessageSummary({ planId: "gold", unreadTexts: ["긴 대화"], enabled: true }),
    ).resolves.toMatchObject({ available: true, summary: "요약" });
  });

  it("polls messages every five seconds", () => {
    expect(getChatMessagesQueryOptions("demo-room")).toEqual({
      pollInterval: CHAT_MESSAGES_POLL_INTERVAL,
      variables: { input: { roomId: "demo-room", first: 50, after: null } },
    });
    expect(CHAT_MESSAGES_POLL_INTERVAL).toBe(5_000);
  });

  it("puts attachment bytes to signed upload URL", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    setUploadFetcher(async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return new Response(null, { status: 200 });
    });

    await uploadFileToSignedUrl({
      putUrl: "https://uploads.invalid/upload-id",
      contentType: "image/jpeg",
      body: "bytes",
    });

    expect(calls[0]).toMatchObject({
      url: "https://uploads.invalid/upload-id",
      init: { method: "PUT", body: "bytes" },
    });
    expect((calls[0]!.init.headers as Record<string, string>)["content-type"]).toBe("image/jpeg");
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
