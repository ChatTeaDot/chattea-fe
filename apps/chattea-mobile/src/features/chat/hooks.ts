import { useMutation, useQuery } from "@apollo/client/react";
import { randomUUID } from "expo-crypto";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, AppState } from "react-native";

import { ME_QUERY, type MeData } from "@/features/profile";
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
  normalizeMessageDraft,
  toSendChatMessageVariables,
} from "./utils/message-policy";
import {
  createOptimisticChatMessage,
  dedupeChatMessages,
  isChatPollingEnabled,
  mergeChatMessage,
} from "./utils/message-sync";

export const useChatRooms = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const openRoom = (id: string) => router.push(`/rooms/${id}`);

  return { rooms, openRoom };
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
  const [focused, setFocused] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const messageTextLimit = getMessageTextLimit(
    hasConversationStarted(
      messages.data?.chatMessages.length ?? 0,
      Boolean(roomId && lastSentRoomId === roomId),
    ),
  );
  const messageDraft = normalizeMessageDraft(draft.text, messageTextLimit);

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
  const messageList = dedupeChatMessages(messages.data?.chatMessages ?? []);

  return {
    messages,
    messageList,
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
