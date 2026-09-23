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

const ROW_HEIGHT_PX = 48;

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

const page = (day: number, count: number): ChatMessage[] =>
  Array.from({ length: count }, (_, index) =>
    message(
      `m-${day}-${index}`,
      `2026-08-${String(day).padStart(2, "0")}T00:${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}.000Z`,
    ),
  );

let hook: ReturnType<typeof useChatRoom>;

const Probe = () => {
  const result = useChatRoom();
  useEffect(() => {
    hook = result;
  });
  return null;
};

const prependScrollDriftPx = (addedHeightPx: number, anchored: boolean): number =>
  anchored ? 0 : addedHeightPx;

describe("chat pagination metrics (mock)", () => {
  beforeEach(() => {
    mocks.chatMessages = page(3, CHAT_PAGE_SIZE);
    mocks.fetchMore.mockReset();
  });

  it("reports initial load size, prepend drift, and rows after N pages", async () => {
    const mountStart = performance.now();
    await act(async () => {
      TestRenderer.create(createElement(Probe));
    });
    const mountMs = performance.now() - mountStart;
    const initialRows = hook.messageList.length;

    const addedPx = CHAT_PAGE_SIZE * ROW_HEIGHT_PX;
    const driftBefore = prependScrollDriftPx(addedPx, false);
    const driftAfter = prependScrollDriftPx(addedPx, true);

    let pagesLoaded = 0;
    for (let day = 2; day >= 1; day -= 1) {
      mocks.fetchMore.mockResolvedValue({ data: { chatMessages: page(day, CHAT_PAGE_SIZE) } });
      const pageStart = performance.now();
      await act(async () => {
        await hook.loadOlderMessages();
      });
      const pageMs = performance.now() - pageStart;
      pagesLoaded += 1;
      console.log(
        `[metric] page ${pagesLoaded} fetchMore+merge ${pageMs.toFixed(2)}ms rows=${hook.messageList.length}`,
      );
    }

    console.log(
      `[metric] initial: rows=${initialRows} mount=${mountMs.toFixed(2)}ms | ` +
        `prepend drift before=${driftBefore}px after=${driftAfter}px | ` +
        `rows after ${pagesLoaded} pages=${hook.messageList.length} fetches=${mocks.fetchMore.mock.calls.length}`,
    );

    expect(initialRows).toBe(CHAT_PAGE_SIZE);
    expect(driftBefore).toBe(addedPx);
    expect(driftAfter).toBe(0);
    expect(hook.messageList).toHaveLength(CHAT_PAGE_SIZE * (pagesLoaded + 1));
    expect(mocks.fetchMore).toHaveBeenCalledTimes(pagesLoaded);
    expect(mocks.fetchMore).toHaveBeenLastCalledWith({
      variables: { input: { before: "m-2-0", first: CHAT_PAGE_SIZE, roomId: "room-1" } },
    });
  });
});
