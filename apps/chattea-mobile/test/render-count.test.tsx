import { type ComponentType, createElement, type ReactNode, useEffect, useState } from "react";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LikesScreen from "../src/screens/likes-screen";
import MatchListScreen from "../src/screens/match-list-screen";
import RoomsScreen from "../src/screens/rooms-screen";
import TodayMatchesScreen from "../src/screens/today-matches-screen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Room = {
  id: string;
  lastMessage: string | null;
  name: string;
  unreadCount: number;
};

type LikedCandidate = {
  id: string;
  photos: { url: string }[];
  userName: string;
};

const mocks = vi.hoisted(() => ({
  chatRooms: [] as Room[],
  legendLists: [] as Record<string, unknown>[],
  likedMeCandidates: [] as LikedCandidate[],
  matchCandidates: [] as {
    age: number;
    id: string;
    photos: { url: string }[];
    region: string;
    userName: string;
  }[],
  mutationFunctions: [] as ReturnType<typeof vi.fn>[],
  queryRefetch: vi.fn(),
  renderCounts: {
    likeGridCell: 0,
    matchActionBar: 0,
    newMatchAvatar: 0,
    roomRow: 0,
    swipeCard: 0,
  },
  rerender: () => undefined as void,
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: () => {
    mocks.mutationFunctions[0] ??= vi.fn(async () => ({
      data: { likeUser: { matched: false, roomId: null } },
    }));
    return [mocks.mutationFunctions[0], { loading: false }];
  },
  useQuery: () => ({
    data: {
      chatRooms: mocks.chatRooms,
      consumableBalance: { activeBoostUntil: null, boostCredits: 0, superLikeCredits: 0 },
      likedMeCandidates: mocks.likedMeCandidates,
      matchCandidates: mocks.matchCandidates,
    },
    error: undefined,
    loading: false,
    refetch: mocks.queryRefetch,
  }),
}));

vi.mock("expo-crypto", () => ({
  randomUUID: () => "9d4d6a3e-7f57-4fb8-9275-ae94878316eb",
}));

vi.mock("react-native-purchases", () => ({
  default: { configure: vi.fn(), getOfferings: vi.fn() },
}));

vi.mock("react-native-keyboard-controller", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    KeyboardStickyView: ({ children }: { children?: ReactNode }) =>
      React.createElement("nav", null, children),
  };
});

vi.mock("expo-symbols", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    SymbolView: ({ children }: { children?: ReactNode }) =>
      React.createElement("div", { "data-symbol": true }, children),
  };
});

vi.mock("@legendapp/list/react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const renderSlot = (slot: ReactNode | ComponentType | undefined) => {
    if (!slot) return null;
    return React.isValidElement(slot)
      ? slot
      : React.createElement(slot as ComponentType<Record<string, never>>);
  };
  return {
    LegendList: (props: Record<string, unknown>) => {
      mocks.legendLists.push(props);
      const data = props.data as unknown[];
      const renderItem = props.renderItem as (info: { index: number; item: unknown }) => ReactNode;
      return React.createElement(
        "section",
        { "data-legend-list": true },
        renderSlot(props.ListHeaderComponent as ReactNode | ComponentType | undefined),
        data.length
          ? data.map((item, index) =>
              React.createElement(
                React.Fragment,
                { key: String((item as { id?: string }).id ?? index) },
                renderItem({ index, item }),
              ),
            )
          : renderSlot(props.ListEmptyComponent as ReactNode | ComponentType | undefined),
        renderSlot(props.ListFooterComponent as ReactNode | ComponentType | undefined),
      );
    },
  };
});

vi.mock("expo-image", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement("img", { alt: props.accessibilityLabel as string }),
  };
});

vi.mock("expo-router", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const Toolbar = Object.assign(
    ({ children }: { children?: ReactNode }) => React.createElement("aside", null, children),
    {
      Button: ({ children }: { children?: ReactNode }) =>
        React.createElement("button", null, children),
      Label: ({ children }: { children?: ReactNode }) =>
        React.createElement("span", null, children),
    },
  );
  return {
    router: { push: vi.fn(), replace: vi.fn(), back: vi.fn() },
    Stack: { Screen: () => null, Toolbar },
    useLocalSearchParams: () => ({}),
  };
});

vi.mock("expo-router/react-navigation", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return { HeaderHeightContext: React.createContext(0) };
});

vi.mock("expo-blur", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    BlurView: ({ children }: { children?: ReactNode }) =>
      React.createElement("div", { "data-blur": true }, children),
  };
});

vi.mock("react-native-gesture-handler", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const container = ({ children }: { children?: ReactNode }) =>
    React.createElement("div", null, children);
  const chainable: Record<string, unknown> = new Proxy({} as Record<string, unknown>, {
    get: (target, prop) => target[String(prop)] ?? (() => chainable),
  });
  return {
    Gesture: {
      Exclusive: () => chainable,
      Pan: () => chainable,
      Tap: () => chainable,
    },
    GestureDetector: container,
    GestureHandlerRootView: container,
  };
});

vi.mock("react-native-reanimated", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const View = ({ children }: { children?: ReactNode }) =>
    React.createElement("div", null, children);
  return {
    default: { View },
    interpolate: (_value: number, _input: number[], output: number[]) => output[0],
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: unknown) => ({ value }),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

vi.mock("lucide-react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const icon = (name: string) => {
    const Icon = () => React.createElement("i", { "data-icon": name });
    Icon.displayName = name;
    return Icon;
  };
  return {
    Bell: icon("bell"),
    CheckCheck: icon("check-check"),
    EllipsisVertical: icon("ellipsis-vertical"),
    Heart: icon("heart"),
    Lock: icon("lock"),
    Send: icon("send"),
    Sparkles: icon("sparkles"),
    Undo2: icon("undo-2"),
    X: icon("x"),
  };
});

vi.mock("react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const container = (tag: string) => {
    const Container = ({ children }: { children?: ReactNode }) =>
      React.createElement(tag, null, children);
    Container.displayName = `Native${tag}`;
    return Container;
  };
  return {
    ActivityIndicator: () => React.createElement("i"),
    Alert: { alert: vi.fn() },
    KeyboardAvoidingView: container("main"),
    Platform: { OS: "ios" },
    Pressable: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement("button", props, children as ReactNode),
    ScrollView: container("section"),
    Text: container("span"),
    TextInput: () => React.createElement("input"),
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    View: container("div"),
  };
});

vi.mock("react-native-safe-area-context", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    SafeAreaView: ({ children }: { children?: ReactNode }) =>
      React.createElement("footer", null, children),
    useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 0 }),
  };
});

vi.mock("react-native-unistyles", async () => {
  const { colors, radii, sizes, spacing, typography } =
    await import("@chattea/design-system/theme/constants");
  return {
    StyleSheet: {
      absoluteFillObject: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
      create: (factory: (theme: Record<string, unknown>, rt: Record<string, unknown>) => unknown) =>
        factory(
          { colors, radii, sizes, spacing, typography },
          { insets: { bottom: 0, left: 0, right: 0, top: 0 } },
        ),
    },
    useUnistyles: () => ({
      rt: { insets: { bottom: 0, left: 0, right: 0, top: 0 } },
      theme: { colors, radii, sizes, spacing, typography },
    }),
  };
});

vi.mock("../src/features/chat/components/room-row", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../src/features/chat/components/room-row")>();
  const Real = mod.default;
  const Counted = (props: Parameters<typeof Real>[0]) => {
    mocks.renderCounts.roomRow += 1;
    return createElement(Real, props);
  };
  return { default: Counted };
});

vi.mock("../src/features/matches/components/like-grid-cell", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("../src/features/matches/components/like-grid-cell")>();
  const Real = mod.default;
  const Counted = (props: Parameters<typeof Real>[0]) => {
    mocks.renderCounts.likeGridCell += 1;
    return createElement(Real, props);
  };
  return { default: Counted };
});

vi.mock("../src/features/matches/components/swipe-card", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("../src/features/matches/components/swipe-card")>();
  const Real = mod.default;
  const Counted = (props: Parameters<typeof Real>[0]) => {
    mocks.renderCounts.swipeCard += 1;
    return createElement(Real, props);
  };
  return { default: Counted };
});

vi.mock("../src/features/matches/components/match-action-bar", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("../src/features/matches/components/match-action-bar")>();
  const Real = mod.default;
  const Counted = (props: Parameters<typeof Real>[0]) => {
    mocks.renderCounts.matchActionBar += 1;
    return createElement(Real, props);
  };
  return { default: Counted };
});

vi.mock("../src/features/matches/components/new-match-avatar", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("../src/features/matches/components/new-match-avatar")>();
  const Real = mod.default;
  const Counted = (props: Parameters<typeof Real>[0]) => {
    mocks.renderCounts.newMatchAvatar += 1;
    return createElement(Real, props);
  };
  return { default: Counted };
});

const rooms = (count: number): Room[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `room-${index}`,
    lastMessage: `메시지 ${index}`,
    name: `대화 ${index}`,
    unreadCount: index % 5,
  }));

const likedCandidates = (count: number): LikedCandidate[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `like-${index}`,
    photos: [{ url: `https://example.com/${index}.jpg` }],
    userName: `후보 ${index}`,
  }));

const Harness = ({ screen: Screen }: { screen: ComponentType }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    mocks.rerender = () => setTick((tick) => tick + 1);
  }, []);
  return <Screen />;
};

const mount = (Screen: ComponentType) => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Harness screen={Screen} />);
  });
  if (!renderer) throw new Error("MOUNT_FAILED");
  return renderer;
};

const resetCounts = () => {
  mocks.renderCounts.likeGridCell = 0;
  mocks.renderCounts.matchActionBar = 0;
  mocks.renderCounts.newMatchAvatar = 0;
  mocks.renderCounts.roomRow = 0;
  mocks.renderCounts.swipeCard = 0;
};

beforeEach(() => {
  mocks.chatRooms = rooms(30);
  mocks.likedMeCandidates = likedCandidates(20);
  mocks.matchCandidates = [
    {
      age: 30,
      id: "candidate-1",
      photos: [{ url: "https://example.com/candidate.jpg" }],
      region: "서울",
      userName: "후보",
    },
  ];
  mocks.legendLists.length = 0;
  mocks.mutationFunctions.length = 0;
  mocks.queryRefetch.mockReset().mockResolvedValue({ data: {} });
  resetCounts();
});

describe("list render counts", () => {
  it("re-renders only the changed room row when a poll delivers a new message", () => {
    mount(RoomsScreen);
    expect(mocks.renderCounts.roomRow).toBe(30);

    resetCounts();
    const next = mocks.chatRooms.map((room) => ({ ...room }));
    const changedRoom = next[7];
    if (changedRoom) next[7] = { ...changedRoom, lastMessage: "새 메시지" };
    mocks.chatRooms = next;
    act(() => mocks.rerender());

    expect(mocks.renderCounts.roomRow).toBe(1);
  });

  it("re-renders only the changed like grid cell when a candidate updates", () => {
    mount(LikesScreen);
    expect(mocks.renderCounts.likeGridCell).toBe(20);

    resetCounts();
    const next = mocks.likedMeCandidates.map((item) => ({ ...item }));
    const changedCandidate = next[3];
    if (changedCandidate) next[3] = { ...changedCandidate, userName: "바뀐 후보" };
    mocks.likedMeCandidates = next;
    act(() => mocks.rerender());

    expect(mocks.renderCounts.likeGridCell).toBe(1);
  });

  it("skips the swipe card and action bar on an unrelated parent re-render", () => {
    mount(TodayMatchesScreen);
    expect(mocks.renderCounts.swipeCard).toBe(1);
    expect(mocks.renderCounts.matchActionBar).toBe(1);

    resetCounts();
    act(() => mocks.rerender());

    expect(mocks.renderCounts.swipeCard).toBe(0);
    expect(mocks.renderCounts.matchActionBar).toBe(0);
  });

  it("skips the new match avatar row on an unrelated parent re-render", () => {
    mocks.chatRooms = rooms(10).map((room) => ({ ...room, lastMessage: null }));
    mount(MatchListScreen);
    expect(mocks.renderCounts.newMatchAvatar).toBe(10);

    resetCounts();
    act(() => mocks.rerender());

    expect(mocks.renderCounts.newMatchAvatar).toBe(0);
  });

  it("gives the virtualized lists stable identity and size hints", () => {
    mount(RoomsScreen);
    mount(LikesScreen);

    expect(mocks.legendLists).toHaveLength(2);
    for (const props of mocks.legendLists) {
      expect(props.keyExtractor).toBeTypeOf("function");
      expect(props.estimatedItemSize).toBeTypeOf("number");
      expect(props.recycleItems).toBe(true);
    }
  });
});
