import { useMutation, useQuery } from "@apollo/client/react";
import { randomUUID } from "expo-crypto";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState } from "react-native";

import { ME_QUERY, type MeData } from "@/features/profile";
import { apolloClient } from "@/shared/graphql";
import { useRouteParam } from "@/shared/hooks";
import { showActionError } from "@/shared/lib";

import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  type ChatMessage,
  MARK_ROOM_READ_MUTATION,
  type MessagesData,
  REPORT_MESSAGE_MUTATION,
  type RoomsData,
  SEND_MESSAGE_MUTATION,
} from "./api";
import { CHAT_PAGE_SIZE, CHAT_POLL_INTERVAL_MS } from "./constants";
import {
  createChatMessageDraft,
  getMessageTextLimit,
  hasConversationStarted,
  mergeChatMessages,
  normalizeMessageDraft,
  toSendChatMessageVariables,
} from "./utils";
import {
  createOptimisticChatMessage,
  isChatPollingEnabled,
  mergeChatMessage,
} from "./utils/message-sync";

export const useChatRooms = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const openRoom = (id: string) => router.push(`/rooms/${id}`);
  const prefetchRoom = (id: string) => {
    void apolloClient
      .query<MessagesData>({
        query: CHAT_MESSAGES_QUERY,
        variables: { input: { roomId: id, first: CHAT_PAGE_SIZE } },
      })
      .catch(() => undefined);
  };

  return { rooms, openRoom, prefetchRoom };
};

export const useChatRoom = () => {
  const roomId = useRouteParam("room-id");
  const me = useQuery<MeData>(ME_QUERY);
  const roomsQuery = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const messages = useQuery<MessagesData>(CHAT_MESSAGES_QUERY, {
    skip: !roomId,
    variables: { input: { roomId, first: CHAT_PAGE_SIZE } },
  });
  const [markRead] = useMutation<{ markChatRoomRead: boolean }>(MARK_ROOM_READ_MUTATION);
  const [send, sendState] = useMutation<{ sendChatMessage: ChatMessage }>(SEND_MESSAGE_MUTATION);
  const [report] = useMutation<{ reportChatMessage: boolean }>(REPORT_MESSAGE_MUTATION);
  const [draft, setDraft] = useState(() => createChatMessageDraft(randomUUID));
  const [lastSentRoomId, setLastSentRoomId] = useState<string | null>(null);
  const [history, setHistory] = useState({ roomId, messages: [] as ChatMessage[], loading: false });
  const pagination = useRef({ hasMore: true, loading: false, roomId });
  const [focused, setFocused] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const newestMessages = messages.data?.chatMessages;
  const messageList = useMemo(
    () =>
      mergeChatMessages(history.roomId === roomId ? history.messages : [], newestMessages ?? []),
    [history, newestMessages, roomId],
  );
  const loadingOlder = history.roomId === roomId && history.loading;
  const messageTextLimit = getMessageTextLimit(
    hasConversationStarted(
      messages.data?.chatMessages.length ?? 0,
      Boolean(roomId && lastSentRoomId === roomId),
    ),
  );
  const messageDraft = normalizeMessageDraft(draft.text, messageTextLimit);

  const loadOlderMessages = async () => {
    const oldest = messageList[0];
    if (!roomId || !oldest) return;
    if (pagination.current.roomId !== roomId) {
      pagination.current = { hasMore: true, loading: false, roomId };
    }
    const state = pagination.current;
    if (state.loading || !state.hasMore) return;
    if ((newestMessages?.length ?? 0) < CHAT_PAGE_SIZE) {
      state.hasMore = false;
      return;
    }
    state.loading = true;
    setHistory((prev) => ({ ...prev, loading: true }));
    try {
      const result = await messages.fetchMore({
        variables: { input: { roomId, first: CHAT_PAGE_SIZE, before: oldest.id } },
      });
      const fetched = result.data?.chatMessages ?? [];
      if (pagination.current.roomId !== roomId) return;
      if (fetched.length < CHAT_PAGE_SIZE) pagination.current.hasMore = false;
      setHistory((prev) =>
        prev.roomId === roomId
          ? { ...prev, messages: mergeChatMessages(fetched, prev.messages) }
          : prev,
      );
    } finally {
      state.loading = false;
      setHistory((prev) => (prev.roomId === roomId ? { ...prev, loading: false } : prev));
    }
  };

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  const { refetch, startPolling, stopPolling } = messages;
  useEffect(() => {
    if (!roomId || !isChatPollingEnabled(appState, focused)) {
      stopPolling();
      return;
    }
    void refetch();
    startPolling(CHAT_POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [appState, focused, refetch, roomId, startPolling, stopPolling]);

  useEffect(() => {
    if (roomId) void markRead({ variables: { input: { roomId } } });
  }, [markRead, roomId]);

  const sendMessage = async () => {
    if (!roomId || !messageDraft) return;
    const variables = toSendChatMessageVariables(roomId, draft, messageTextLimit);
    const submittedKey = draft.idempotencyKey;
    const optimistic = createOptimisticChatMessage(
      roomId,
      draft,
      messageTextLimit,
      currentUserId ?? null,
    );
    try {
      await send({
        optimisticResponse: { sendChatMessage: optimistic },
        update: (cache, { data }) => {
          const message = data?.sendChatMessage;
          if (!message) return;
          cache.updateQuery<MessagesData>(
            {
              query: CHAT_MESSAGES_QUERY,
              variables: { input: { first: CHAT_PAGE_SIZE, roomId } },
            },
            (existing) =>
              existing && { chatMessages: mergeChatMessage(existing.chatMessages, message) },
          );
        },
        variables,
      });
      setLastSentRoomId(roomId);
      setDraft((current) =>
        current.idempotencyKey === submittedKey ? createChatMessageDraft(randomUUID) : current,
      );
      void messages.refetch();
    } catch {
      showActionError();
    }
  };

  const reportMessage = (messageId: string) => {
    Alert.alert("이 메시지를 신고할까요?", "운영팀이 내용을 확인해요.", [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        style: "destructive",
        onPress: () => {
          void report({ variables: { input: { messageId, reason: "사용자 신고" } } })
            .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
            .catch(showActionError);
        },
      },
    ]);
  };
  const currentUserId = me.data?.me.id;
  const roomName = roomsQuery.data?.chatRooms.find((room) => room.id === roomId)?.name;

  return {
    messages,
    messageList,
    loadingOlder,
    loadOlderMessages,
    roomName,
    draft,
    setDraft,
    messageTextLimit,
    messageDraft,
    sendState,
    sendMessage,
    reportMessage,
    currentUserId,
  };
};
