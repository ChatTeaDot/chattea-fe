import { createElement, useEffect } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  type ChatMessage,
} from "../src/features/chat/api";
import { CHAT_PAGE_SIZE } from "../src/features/chat/constants";
import { useChatRoom } from "../src/features/chat/hooks";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  chatMessages: [] as ChatMessage[],
  fetchMore: vi.fn(),
  meQuery: { kind: "me-query" },
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [vi.fn().mockResolvedValue({ data: {} }), { loading: false }],
  useQuery: (query: unknown) => {
    if (query === mocks.meQuery) return { data: { me: { id: "me" } } };
    if (query === CHAT_ROOMS_QUERY) {
      return {
        data: { chatRooms: [{ id: "room-1", lastMessage: null, name: "대화", unreadCount: 0 }] },
      };
    }
    if (query === CHAT_MESSAGES_QUERY) {
      return {
        data: { chatMessages: mocks.chatMessages },
        fetchMore: mocks.fetchMore,
        loading: false,
        refetch: vi.fn(),
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      };
    }
    return { data: undefined };
  },
}));
vi.mock("@/features/profile", () => ({ ME_QUERY: mocks.meQuery }));
vi.mock("@/shared/hooks", () => ({ useRouteParam: () => "room-1" }));
vi.mock("@/shared/lib", () => ({ showActionError: vi.fn() }));
vi.mock("expo-crypto", () => ({ randomUUID: () => "draft-key" }));
vi.mock("expo-router", () => ({ router: { push: vi.fn() }, useFocusEffect: vi.fn() }));
vi.mock("react-native", () => ({
  Alert: { alert: vi.fn() },
  AppState: { currentState: "active", addEventListener: () => ({ remove: vi.fn() }) },
}));

const message = (id: string, createdAt: string): ChatMessage => ({
  createdAt,
  id,
  idempotencyKey: null,
  roomId: "room-1",
  senderUserId: "user-1",
  text: id,
});

const stamp = (day: number, index: number): string =>
  `2026-08-${String(day).padStart(2, "0")}T00:00:${String(index).padStart(2, "0")}.000Z`;

const page = (day: number, start: number, count: number): ChatMessage[] =>
  Array.from({ length: count }, (_, index) =>
    message(`m-${day}-${start + index}`, stamp(day, start + index)),
  );

let hook: ReturnType<typeof useChatRoom>;

const Probe = () => {
  const result = useChatRoom();
  useEffect(() => {
    hook = result;
  });
  return null;
};

const mount = async () => {
  await act(async () => {
    TestRenderer.create(createElement(Probe));
  });
};

describe("useChatRoom pagination", () => {
  beforeEach(() => {
    mocks.chatMessages = page(2, 0, CHAT_PAGE_SIZE);
    mocks.fetchMore.mockReset();
  });

  it("fetches the previous page with a before cursor on the oldest loaded message", async () => {
    const older = page(1, 0, 5);
    mocks.fetchMore.mockResolvedValue({ data: { chatMessages: older } });
    await mount();

    await act(async () => {
      await hook.loadOlderMessages();
    });

    expect(mocks.fetchMore).toHaveBeenCalledTimes(1);
    expect(mocks.fetchMore).toHaveBeenCalledWith({
      variables: { input: { before: "m-2-0", first: CHAT_PAGE_SIZE, roomId: "room-1" } },
    });
    expect(hook.messageList.map((m) => m.id)).toEqual([...older, ...page(2, 0, CHAT_PAGE_SIZE)].map((m) => m.id));
  });

  it("does not request more when the newest window is already smaller than a page", async () => {
    mocks.chatMessages = page(2, 0, 3);
    await mount();

    await act(async () => {
      await hook.loadOlderMessages();
    });

    expect(mocks.fetchMore).not.toHaveBeenCalled();
  });

  it("ignores a retrigger while a previous page request is in flight", async () => {
    let resolveFetch: (value: { data: { chatMessages: ChatMessage[] } }) => void = () => undefined;
    mocks.fetchMore.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    await mount();

    await act(async () => {
      void hook.loadOlderMessages();
      void hook.loadOlderMessages();
    });
    expect(mocks.fetchMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({ data: { chatMessages: page(1, 0, CHAT_PAGE_SIZE) } });
    });
    await act(async () => {
      void hook.loadOlderMessages();
    });
    expect(mocks.fetchMore).toHaveBeenCalledTimes(2);
  });

  it("stops fetching after a short page signals the start of history", async () => {
    mocks.fetchMore.mockResolvedValue({ data: { chatMessages: page(1, 0, CHAT_PAGE_SIZE - 1) } });
    await mount();

    await act(async () => {
      await hook.loadOlderMessages();
      await hook.loadOlderMessages();
    });

    expect(mocks.fetchMore).toHaveBeenCalledTimes(1);
  });

  it("dedups overlapping ids between the fetched page and the loaded window", async () => {
    const overlapping = [page(2, 0, 1)[0]!, ...page(1, 0, 4)];
    mocks.fetchMore.mockResolvedValue({ data: { chatMessages: overlapping } });
    await mount();

    await act(async () => {
      await hook.loadOlderMessages();
    });

    const ids = hook.messageList.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(hook.messageList).toHaveLength(CHAT_PAGE_SIZE + 4);
  });
});
