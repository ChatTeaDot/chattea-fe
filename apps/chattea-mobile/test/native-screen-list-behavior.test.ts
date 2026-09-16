import { createRequire } from "node:module";

import { type ComponentType, createElement, isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLikesErrorKind } from "../src/features/matches/utils/likes-error";
import CandidateDetailScreen from "../src/screens/candidate-detail-screen";
import CommunityPostScreen from "../src/screens/community-post-screen";
import CommunityScreen from "../src/screens/community-screen";
import LikesScreen from "../src/screens/likes-screen";
import MatchListScreen from "../src/screens/match-list-screen";
import MatchSheetScreen from "../src/screens/match-sheet-screen";
import NotificationsScreen from "../src/screens/notifications-screen";
import ProfileFormScreen from "../src/screens/profile-form-screen";
import RoomScreen from "../src/screens/room-screen";
import RoomsScreen from "../src/screens/rooms-screen";
import TodayMatchesScreen from "../src/screens/today-matches-screen";
import { runExclusiveAction } from "../src/shared/lib";

const { renderToStaticMarkup } = createRequire(import.meta.url)("react-dom/server") as {
  renderToStaticMarkup: (node: ReactNode) => string;
};

type CapturedButton = {
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityState?: Record<string, unknown>;
  disabled: boolean;
  label: string;
  onPress?: () => void;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const mocks = vi.hoisted(() => ({
  alert: vi.fn(),
  emptyQueries: false,
  images: [] as Record<string, unknown>[],
  inputs: [] as Record<string, unknown>[],
  legendLists: [] as Record<string, unknown>[],
  mutationCallIndex: 0,
  mutationFunctions: [] as ReturnType<typeof vi.fn>[],
  mutationImplementations: [] as (((...args: unknown[]) => Promise<unknown>) | undefined)[],
  mutationLoadingIndex: -1,
  mutationOptions: [] as Record<string, unknown>[],
  pressables: [] as CapturedButton[],
  queryError: undefined as Error | undefined,
  queryLoading: false,
  queryOptions: [] as (Record<string, unknown> | undefined)[],
  queryRefetch: vi.fn(),
  safeAreas: [] as Record<string, unknown>[],
}));

const candidate = {
  age: 30,
  blackRecommended: false,
  boostActive: false,
  gender: "female",
  id: "candidate-1",
  intro: "반가워요",
  likedByMe: false,
  photos: [{ position: 0, url: "https://example.com/candidate.jpg" }],
  planId: "free",
  region: "서울",
  userName: "후보",
};

const consumableBalance: {
  activeBoostUntil: string | null;
  boostCredits: number;
  superLikeCredits: number;
} = {
  activeBoostUntil: null,
  boostCredits: 2,
  superLikeCredits: 3,
};

const queryData = {
  chatMessages: [
    {
      createdAt: "2026-08-28T00:00:00.000Z",
      id: "message-1",
      idempotencyKey: null,
      roomId: "room-1",
      senderUserId: "other-user",
      text: "안녕하세요",
    },
  ],
  chatRooms: [{ id: "room-1", lastMessage: "안녕하세요", name: "대화", unreadCount: 1 }],
  communityComments: [
    {
      authorName: "댓글 작성자",
      body: "댓글",
      createdAt: "2026-08-28T00:00:00.000Z",
      id: "comment-1",
      postId: "post-1",
    },
  ],
  communityPosts: [
    {
      authorName: "글 작성자",
      body: "본문",
      commentCount: 1,
      createdAt: "2026-08-28T00:00:00.000Z",
      id: "post-1",
      title: "제목",
    },
  ],
  consumableBalance,
  likedMeCandidates: [candidate],
  matchCandidates: [candidate],
  me: {
    birthDate: "1996-08-29",
    email: "me@example.com",
    gender: "female",
    id: "me",
    interestedGender: "male",
    intro: "안녕하세요",
    phone: null,
    photos: [{ id: "profile-photo-1", position: 0, url: "https://example.com/me.jpg" }],
    profileCompleted: true,
    region: "서울",
    userName: "사용자",
  },
  notifications: [
    {
      body: "새 소식",
      createdAt: "2026-08-28T00:00:00.000Z",
      id: "notification-1",
      readAt: null,
      route: "/rooms/room-1",
      title: "알림",
      type: "message",
    },
  ],
};

const emptyQueryData = {
  ...queryData,
  chatMessages: [],
  chatRooms: [],
  communityComments: [],
  communityPosts: [],
  likedMeCandidates: [],
  matchCandidates: [],
  notifications: [],
};

const mutationResult = {
  data: {
    activateBoost: {
      activeUntil: "2099-08-28T01:00:00.000Z",
      remainingBoostCredits: 1,
    },
    likeUser: { matched: false, roomId: null },
    skipMatchCandidate: true,
    superLikeUser: { matched: false, roomId: null },
    undoLastMatchAction: { reverted: true },
  },
};

const textContent = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  return textContent(node.props.children);
};

vi.mock("@apollo/client/react", () => ({
  useMutation: (_mutation: unknown, options?: Record<string, unknown>) => {
    const index = mocks.mutationCallIndex;
    mocks.mutationCallIndex += 1;
    mocks.mutationOptions[index] = options ?? {};
    const mutate = vi.fn((...args: unknown[]) => {
      const implementation = mocks.mutationImplementations[index];
      return implementation ? implementation(...args) : Promise.resolve(mutationResult);
    });
    mocks.mutationFunctions[index] = mutate;
    return [mutate, { loading: index === mocks.mutationLoadingIndex }];
  },
  useQuery: (_query: unknown, options?: Record<string, unknown>) => {
    mocks.queryOptions.push(options);
    return {
      data: mocks.emptyQueries ? emptyQueryData : queryData,
      error: mocks.queryError,
      loading: mocks.queryLoading,
      refetch: mocks.queryRefetch,
    };
  },
}));
vi.mock("@/features/profile/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/features/profile/api")>()),

  selectAndUploadProfilePhoto: vi.fn(),
}));
vi.mock("expo-crypto", () => ({
  randomUUID: () => "9d4d6a3e-7f57-4fb8-9275-ae94878316eb",
}));
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
    Image: (props: Record<string, unknown>) => {
      mocks.images.push(props);
      return React.createElement("img", { alt: props.accessibilityLabel as string });
    },
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
    useLocalSearchParams: () => ({
      "candidate-id": "candidate-1",
      name: "후보",
      photo: "https://example.com/candidate.jpg",
      "post-id": "post-1",
      "room-id": "room-1",
    }),
  };
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
    useReducedMotion: () => false,
    useSharedValue: (value: unknown) => ({ value }),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});
vi.mock("react-native-keyboard-controller", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    KeyboardStickyView: ({ children }: { children?: ReactNode }) =>
      React.createElement("nav", null, children),
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
    CheckCheck: icon("check-check"),
    EllipsisVertical: icon("ellipsis-vertical"),
    Send: icon("send"),
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
    Alert: { alert: mocks.alert },
    KeyboardAvoidingView: container("main"),
    Platform: { OS: "ios" },
    Pressable: ({
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      children,
      disabled = false,
      onPress,
    }: Record<string, unknown>) => {
      const label = textContent(children as ReactNode);
      mocks.pressables.push({
        accessibilityLabel: accessibilityLabel as string | undefined,
        accessibilityRole: accessibilityRole as string | undefined,
        accessibilityState: accessibilityState as Record<string, unknown> | undefined,
        disabled: Boolean(disabled),
        label,
        onPress: onPress as () => void,
      });
      return React.createElement("button", { disabled: Boolean(disabled) }, children as ReactNode);
    },
    ScrollView: container("section"),
    Text: container("span"),
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    TextInput: (props: Record<string, unknown>) => {
      mocks.inputs.push(props);
      return React.createElement("input");
    },
    View: container("div"),
  };
});
vi.mock("react-native-safe-area-context", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    SafeAreaView: ({ children, ...props }: Record<string, unknown>) => {
      mocks.safeAreas.push(props);
      return React.createElement(
        "footer",
        { "data-safe-area-bottom": true },
        children as ReactNode,
      );
    },
    useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 0 }),
  };
});
vi.mock("react-native-unistyles", async () => {
  const { colors, radii, sizes, spacing, typography } = await import("../src/theme/constants");
  return {
    StyleSheet: {
      create: (factory: (theme: Record<string, unknown>) => unknown) =>
        factory({ colors, radii, sizes, spacing, typography }),
    },
    useUnistyles: () => ({ theme: { colors, radii, sizes, spacing, typography } }),
  };
});

const deferred = <T>(): Deferred<T> => {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const renderScreen = (Screen: ComponentType) => renderToStaticMarkup(createElement(Screen));

const paidActionLabels = ["이번엔 넘기기", "관심 보내기", "되돌리기"];

const paidActions = () =>
  mocks.pressables.filter(({ accessibilityLabel }) =>
    paidActionLabels.includes(accessibilityLabel ?? ""),
  );

const button = (label: string) => {
  const match = mocks.pressables.find(
    (pressable) => pressable.label === label || pressable.accessibilityLabel === label,
  );
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
};

beforeEach(() => {
  mocks.alert.mockReset();
  mocks.emptyQueries = false;
  mocks.images.length = 0;
  mocks.inputs.length = 0;
  mocks.legendLists.length = 0;
  mocks.mutationCallIndex = 0;
  mocks.mutationFunctions.length = 0;
  mocks.mutationImplementations.length = 0;
  mocks.mutationLoadingIndex = -1;
  mocks.mutationOptions.length = 0;
  mocks.pressables.length = 0;
  mocks.queryError = undefined;
  mocks.queryLoading = false;
  consumableBalance.activeBoostUntil = null;
  mocks.queryOptions.length = 0;
  mocks.queryRefetch.mockReset().mockResolvedValue({ data: queryData });
  mocks.safeAreas.length = 0;
});

describe("routed native collection screens", () => {
  it.each([
    ["rooms", RoomsScreen],
    ["community", CommunityScreen],
    ["likes", LikesScreen],
    ["notifications", NotificationsScreen],
    ["comments", CommunityPostScreen],
    ["chat", RoomScreen],
  ])("renders %s through the real shared virtualized list", (_name, Screen) => {
    renderScreen(Screen);

    expect(mocks.legendLists).toHaveLength(1);
    expect(mocks.legendLists[0]).toMatchObject({
      automaticallyAdjustKeyboardInsets: true,
      contentInsetAdjustmentBehavior: "automatic",
      data: expect.any(Array),
      keyExtractor: expect.any(Function),
      ListHeaderComponentStyle: expect.any(Array),
      recycleItems: true,
      renderItem: expect.any(Function),
    });
    expect((mocks.legendLists[0]?.ListHeaderComponentStyle as unknown[])[0]).toEqual({
      paddingBottom: 24,
    });
  });

  it("passes the candidate identity to the recycled Expo image", () => {
    renderScreen(LikesScreen);

    expect(mocks.images[0]?.recyclingKey).toBe("candidate-1");
  });

  it.each([
    ["comments", CommunityPostScreen],
    ["chat", RoomScreen],
  ])("keeps the %s composer below the list and inside the bottom safe area", (_name, Screen) => {
    const markup = renderScreen(Screen);

    expect(markup).toMatch(/data-legend-list="true".*data-safe-area-bottom="true"/);
    expect(mocks.safeAreas).toHaveLength(1);
    expect(mocks.safeAreas[0]?.edges).toEqual(["bottom"]);
  });

  it("renders the chat transport error instead of an empty conversation", () => {
    mocks.emptyQueries = true;
    mocks.queryError = new Error("Network request failed");

    expect(renderScreen(RoomScreen)).toContain("내용을 불러오지 못했어요");
  });
});

describe("profile form accessibility", () => {
  it("exposes choice selection and explicit input names to assistive technology", () => {
    renderScreen(ProfileFormScreen);

    expect(button("서울")).toMatchObject({
      accessibilityRole: "radio",
      accessibilityState: { checked: true },
    });
    expect(button("부산")).toMatchObject({
      accessibilityRole: "radio",
      accessibilityState: { checked: false },
    });
    expect(mocks.inputs.map((input) => input.accessibilityLabel)).toEqual([
      "이름",
      "생년월일",
      "소개",
    ]);
  });
});

describe("today match action locking", () => {
  it.each([0, 1, 2, 3, 4])("disables every action while mutation %i is pending", (index) => {
    mocks.mutationLoadingIndex = index;

    renderScreen(TodayMatchesScreen);

    expect(paidActions()).toHaveLength(3);
    expect(paidActions().every(({ disabled }) => disabled)).toBe(true);
  });

  it("disables every action while candidates are loading and observes refetch network state", () => {
    mocks.queryLoading = true;

    renderScreen(TodayMatchesScreen);

    expect(paidActions().every(({ disabled }) => disabled)).toBe(true);
    expect(mocks.queryOptions[0]).toMatchObject({ notifyOnNetworkStatusChange: true });
  });

  it("observes the consumable balance query for boost state", () => {
    renderScreen(TodayMatchesScreen);

    expect(mocks.queryOptions[1]).toMatchObject({
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });
  });

  it("writes the authoritative activation result into the observed balance cache", () => {
    renderScreen(TodayMatchesScreen);
    const updateQuery = vi.fn(
      (
        _options: unknown,
        update: (current: { consumableBalance: typeof consumableBalance }) => unknown,
      ) => update({ consumableBalance: { ...consumableBalance } }),
    );
    const update = mocks.mutationOptions[4]?.update as
      | ((cache: { updateQuery: typeof updateQuery }, result: typeof mutationResult) => void)
      | undefined;

    update?.({ updateQuery }, mutationResult);

    expect(update).toBeTypeOf("function");
    expect(updateQuery).toHaveReturnedWith({
      consumableBalance: {
        activeBoostUntil: "2099-08-28T01:00:00.000Z",
        boostCredits: 1,
        superLikeCredits: 3,
      },
    });
  });

  it("holds the shared guard through mutation and candidate refetch", async () => {
    const mutation = deferred<typeof mutationResult>();
    const refetch = deferred<{ data: typeof queryData }>();
    mocks.mutationImplementations[0] = () => mutation.promise;
    mocks.queryRefetch.mockReturnValue(refetch.promise);
    renderScreen(TodayMatchesScreen);

    button("관심 보내기").onPress?.();
    button("이번엔 넘기기").onPress?.();
    expect(mocks.mutationFunctions[0]).toHaveBeenCalledOnce();
    expect(mocks.mutationFunctions[1]).not.toHaveBeenCalled();

    mutation.resolve(mutationResult);
    await flushPromises();
    expect(mocks.queryRefetch).toHaveBeenCalledOnce();

    button("이번엔 넘기기").onPress?.();
    expect(mocks.mutationFunctions[1]).not.toHaveBeenCalled();

    refetch.resolve({ data: queryData });
    await flushPromises();
    button("이번엔 넘기기").onPress?.();
    expect(mocks.mutationFunctions[1]).toHaveBeenCalledOnce();
  });

  it("handles candidate refetch failures inside the guarded action", async () => {
    mocks.queryRefetch.mockRejectedValue(new Error("refetch failed"));
    renderScreen(TodayMatchesScreen);

    button("관심 보내기").onPress?.();
    await flushPromises();

    expect(mocks.alert).toHaveBeenCalledWith("처리하지 못했어요", "잠시 후 다시 시도해 주세요.");
  });
});

describe("likes interest locking", () => {
  it("disables interest while its mutation is pending", () => {
    mocks.mutationLoadingIndex = 0;

    renderScreen(LikesScreen);

    expect(button("후보님에게 관심 보내기").disabled).toBe(true);
  });

  it("holds one interest action through mutation and refetch", async () => {
    const mutation = deferred<typeof mutationResult>();
    const refetch = deferred<{ data: typeof queryData }>();
    mocks.mutationImplementations[0] = () => mutation.promise;
    mocks.queryRefetch.mockReturnValue(refetch.promise);
    renderScreen(LikesScreen);

    button("후보님에게 관심 보내기").onPress?.();
    button("후보님에게 관심 보내기").onPress?.();
    expect(mocks.mutationFunctions[0]).toHaveBeenCalledOnce();

    mutation.resolve(mutationResult);
    await flushPromises();
    expect(mocks.queryRefetch).toHaveBeenCalledOnce();

    button("후보님에게 관심 보내기").onPress?.();
    expect(mocks.mutationFunctions[0]).toHaveBeenCalledOnce();

    refetch.resolve({ data: queryData });
    await flushPromises();
    button("후보님에게 관심 보내기").onPress?.();
    expect(mocks.mutationFunctions[0]).toHaveBeenCalledTimes(2);
  });

  it("veils liked-me thumbnails behind the plan for free members", () => {
    mocks.queryError = new Error("LIKED_ME_NOT_AVAILABLE");

    const markup = renderScreen(LikesScreen);

    expect(markup).toContain("Basic부터 확인");
    expect(button("누군지 확인하기").accessibilityRole).toBe("button");
  });
});

describe("match list and match sheet", () => {
  it("shows new matches as avatar bubbles with a chat start action", () => {
    const markup = renderScreen(MatchListScreen);

    expect(markup).toContain("새로 매치된 사람");
    expect(button("채팅 시작")).toBeTruthy();
  });

  it("shows the match celebration with chat and later actions", () => {
    const markup = renderScreen(MatchSheetScreen);

    expect(markup).toContain("매치됐어요!");
    expect(markup).toContain("후보님도 회원님을 좋아해요");
    expect(button("채팅하기")).toBeTruthy();
    expect(button("나중에")).toBeTruthy();
  });
});

describe("candidate profile detail", () => {
  it("shows the candidate name, region and intro with a like action", () => {
    const markup = renderScreen(CandidateDetailScreen);

    expect(markup).toContain("후보");
    expect(markup).toContain("서울");
    expect(markup).toContain("반가워요");
    expect(button("좋아요 ♥")).toBeTruthy();
  });
});

describe("native action helpers", () => {
  it("drops a second action while the first action is pending", async () => {
    const action = deferred<void>();
    const guard = { current: false };
    const run = vi.fn(() => action.promise);

    const first = runExclusiveAction(guard, run);
    const second = runExclusiveAction(guard, run);

    expect(run).toHaveBeenCalledOnce();
    action.resolve();
    await Promise.all([first, second]);
    expect(guard.current).toBe(false);
  });

  it("only classifies the known entitlement code as a paywall", () => {
    expect(getLikesErrorKind(new Error("LIKED_ME_NOT_AVAILABLE"))).toBe("entitlement");
    expect(getLikesErrorKind(new Error("Network request failed"))).toBe("retryable");
    expect(
      getLikesErrorKind({ graphQLErrors: [{ extensions: { code: "INTERNAL_SERVER_ERROR" } }] }),
    ).toBe("retryable");
  });
});

vi.mock("react-native-purchases", () => ({ default: {} }));

vi.mock("expo-secure-store", () => ({}));

vi.mock("lucide-react-native", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const icon = (name: string) => {
    const Icon = () => React.createElement("i", { "data-icon": name });
    Icon.displayName = name;
    return Icon;
  };
  return {
    Ban: icon("Ban"),
    Bell: icon("Bell"),
    Check: icon("Check"),
    ChevronLeft: icon("ChevronLeft"),
    ChevronRight: icon("ChevronRight"),
    Crown: icon("Crown"),
    ImagePlus: icon("ImagePlus"),
    LogOut: icon("LogOut"),
    MessageCircle: icon("MessageCircle"),
    Settings: icon("Settings"),
  };
});
