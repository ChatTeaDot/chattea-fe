import { createElement, useEffect } from "react";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChatRoom } from "../src/features/chat/hooks";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookValue = ReturnType<typeof useChatRoom>;

const mocks = vi.hoisted(() => ({
  appState: {
    current: "active",
    listeners: new Set<(state: string) => void>(),
  },
  focusCleanup: null as (() => void) | null,
  hook: null as HookValue | null,
  mutation: vi.fn(),
  query: {
    data: {
      chatMessages: [] as { id: string }[],
      chatRooms: [] as { id: string; name: string }[],
      me: { id: "user-1" },
    },
    error: undefined,
    loading: false,
    refetch: vi.fn(async () => ({})),
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
  },
  showActionError: vi.fn(),
}));

const setAppState = (state: string) => {
  mocks.appState.current = state;
  for (const listener of mocks.appState.listeners) listener(state);
};

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [mocks.mutation, { loading: false }],
  useQuery: () => mocks.query,
}));

vi.mock("expo-crypto", () => ({
  randomUUID: () => "uuid-1",
}));

vi.mock("expo-router", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    router: { push: vi.fn() },
    useFocusEffect: (callback: () => void | (() => void)) => {
      const ref = React.useRef(callback);
      React.useEffect(() => {
        ref.current = callback;
      });
      React.useEffect(() => {
        const cleanup = ref.current();
        mocks.focusCleanup = typeof cleanup === "function" ? cleanup : null;
        return () => cleanup?.();
      }, []);
    },
    useLocalSearchParams: () => ({ "room-id": "room-1" }),
  };
});

vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Alert: { alert: vi.fn() },
    AppState: {
      get currentState() {
        return mocks.appState.current;
      },
      addEventListener: (_event: string, listener: (state: string) => void) => {
        mocks.appState.listeners.add(listener);
        return { remove: () => mocks.appState.listeners.delete(listener) };
      },
    },
    View: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});

vi.mock("../src/features/profile", () => ({
  ME_QUERY: { kind: "Document" },
}));

vi.mock("../src/shared/lib", () => ({
  showActionError: mocks.showActionError,
}));

const Probe = () => {
  const hook = useChatRoom();
  useEffect(() => {
    mocks.hook = hook;
  });
  return null;
};

const mount = () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(createElement(Probe));
  });
  if (!renderer) throw new Error("MOUNT_FAILED");
  return renderer;
};

const blur = () =>
  act(() => {
    mocks.focusCleanup?.();
    mocks.focusCleanup = null;
  });

const send = async (text: string) => {
  act(() => {
    mocks.hook?.setDraft({ idempotencyKey: "key-1", text });
  });
  await act(async () => {
    await mocks.hook?.sendMessage();
  });
};

const sendCall = () =>
  mocks.mutation.mock.calls
    .map(([options]) => options as { optimisticResponse?: unknown; variables?: unknown })
    .find((options) => options.optimisticResponse !== undefined);

beforeEach(() => {
  mocks.appState.current = "active";
  mocks.appState.listeners.clear();
  mocks.focusCleanup = null;
  mocks.hook = null;
  mocks.mutation.mockReset().mockResolvedValue({
    data: {
      sendChatMessage: {
        createdAt: "2026-09-22T00:00:01.000Z",
        id: "real-1",
        idempotencyKey: "key-1",
        roomId: "room-1",
        senderUserId: null,
        text: "안녕",
      },
    },
  });
  mocks.query.data = { chatMessages: [], chatRooms: [], me: { id: "user-1" } };
  mocks.query.refetch.mockReset().mockResolvedValue({});
  mocks.query.startPolling.mockReset();
  mocks.query.stopPolling.mockReset();
  mocks.showActionError.mockReset();
});

describe("chat room realtime polling", () => {
  it("starts polling while focused and stops when the app backgrounds", async () => {
    mount();
    expect(mocks.query.startPolling).toHaveBeenCalledTimes(1);

    await act(async () => setAppState("background"));
    expect(mocks.query.stopPolling).toHaveBeenCalled();

    await act(async () => setAppState("active"));
    expect(mocks.query.startPolling).toHaveBeenCalledTimes(2);
  });

  it("stops polling when the screen blurs", async () => {
    mount();
    expect(mocks.query.startPolling).toHaveBeenCalledTimes(1);

    await blur();
    expect(mocks.query.stopPolling).toHaveBeenCalled();
  });

  it("sends with an optimistic message and a cache merge for the echo", async () => {
    mount();
    await send("안녕");

    const options = sendCall() as {
      optimisticResponse: { sendChatMessage: { id: string; text: string } };
      update: unknown;
      variables: { input: { text: string } };
    };
    expect(options.optimisticResponse.sendChatMessage.text).toBe("안녕");
    expect(options.optimisticResponse.sendChatMessage.id).toContain("key-1");
    expect(options.update).toBeTypeOf("function");
    expect(options.variables.input.text).toBe("안녕");
    expect(mocks.query.refetch).toHaveBeenCalled();
  });

  it("keeps the draft and reports an error when sending fails", async () => {
    mocks.mutation.mockRejectedValue(new Error("NETWORK"));
    mount();

    await send("실패할 메시지");

    expect(mocks.showActionError).toHaveBeenCalledTimes(1);
    expect(mocks.hook?.draft.text).toBe("실패할 메시지");
  });
});
