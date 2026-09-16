import { useMutation, useQuery } from "@apollo/client/react";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { ME_QUERY } from "@/features/profile";
import { type MeData } from "@/features/profile";
import { useRouteParam } from "@/shared/hooks";
import { showActionError } from "@/shared/lib";

import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  MARK_ROOM_READ_MUTATION,
  REPORT_MESSAGE_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "./api";
import { CHAT_PAGE_SIZE, CHAT_POLL_INTERVAL_MS } from "./constants";
import { type ChatMessage, type MessagesData, type RoomsData } from "./types";
import {
  createChatMessageDraft,
  getMessageTextLimit,
  hasConversationStarted,
  normalizeMessageDraft,
  toSendChatMessageVariables,
} from "./utils/message-policy";

export const useChatRooms = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const openRoom = useCallback((id: string) => router.push(`/rooms/${id}`), []);

  return { rooms, openRoom };
};

export const useChatRoom = () => {
  const roomId = useRouteParam("room-id");
  const me = useQuery<MeData>(ME_QUERY);
  const roomsQuery = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const messages = useQuery<MessagesData>(CHAT_MESSAGES_QUERY, {
    skip: !roomId,
    variables: { input: { roomId, first: CHAT_PAGE_SIZE } },
    pollInterval: CHAT_POLL_INTERVAL_MS,
  });
  const [markRead] = useMutation<{ markChatRoomRead: boolean }>(MARK_ROOM_READ_MUTATION);
  const [send, sendState] = useMutation<{ sendChatMessage: ChatMessage }>(SEND_MESSAGE_MUTATION);
  const [report] = useMutation<{ reportChatMessage: boolean }>(REPORT_MESSAGE_MUTATION);
  const [draft, setDraft] = useState(() => createChatMessageDraft(randomUUID));
  const [lastSentRoomId, setLastSentRoomId] = useState<string | null>(null);
  const messageTextLimit = getMessageTextLimit(
    hasConversationStarted(
      messages.data?.chatMessages.length ?? 0,
      Boolean(roomId && lastSentRoomId === roomId),
    ),
  );
  const messageDraft = normalizeMessageDraft(draft.text, messageTextLimit);

  useEffect(() => {
    if (roomId) void markRead({ variables: { input: { roomId } } });
  }, [markRead, roomId]);

  const sendMessage = async () => {
    if (!roomId || !messageDraft) return;
    const variables = toSendChatMessageVariables(roomId, draft, messageTextLimit);
    const submittedKey = draft.idempotencyKey;
    try {
      await send({ variables });
      setLastSentRoomId(roomId);
      setDraft((current) =>
        current.idempotencyKey === submittedKey ? createChatMessageDraft(randomUUID) : current,
      );
      void messages.refetch();
    } catch {
      showActionError();
    }
  };

  const reportMessage = useCallback(
    (messageId: string) => {
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
    },
    [report],
  );
  const currentUserId = me.data?.me.id;
  const roomName = roomsQuery.data?.chatRooms.find((room) => room.id === roomId)?.name;

  return {
    messages,
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
