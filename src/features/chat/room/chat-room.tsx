import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { ContentState, Screen } from "@/shared/components";

import {
  useMarkRoomRead,
  useMessages,
  useReportMessage,
  useRoomRealtime,
  useSendMessage,
  useSetTyping,
} from "../hooks";
import { Message } from "../types";
import { ChatComposer, ChatMessageList, ChatRoomStatus } from "./components";
import { getMessageTextLimit, normalizeMessageDraft } from "./utils/message-limits";
import { reconcileMessages } from "./utils/reconcile-messages";

export const ChatRoomScreen = () => {
  const { "room-id": roomId = "demo-room" } = useLocalSearchParams<{ "room-id": string }>();
  const messages = useMessages(roomId);
  const sendMessage = useSendMessage(roomId);
  const { mutate: markRoomRead } = useMarkRoomRead();
  const roomRealtime = useRoomRealtime(roomId);
  const reportMessage = useReportMessage();
  const { mutate: setTyping } = useSetTyping();
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const listRef = useRef<ScrollView | null>(null);
  const tempIdRef = useRef(0);
  const typingRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const data = reconcileMessages(messages.data ?? [], localMessages);
  const textLimit = getMessageTextLimit(data.length > 0);

  useEffect(() => {
    if (messages.data?.length) {
      markRoomRead(roomId);
    }
  }, [markRoomRead, messages.data?.length, roomId]);

  useEffect(() => {
    if (data.length > 0) {
      void listRef.current?.scrollToEnd({ animated: !reducedMotion });
    }
  }, [data.length, reducedMotion]);

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        setTyping({ roomId, typing: false });
      }
    };
  }, [roomId, setTyping]);

  const send = () => {
    const text = normalizeMessageDraft(draft, textLimit);
    if (!text) {
      return;
    }

    tempIdRef.current += 1;
    const tempId = `temp-${roomId}-${tempIdRef.current}`;
    setLocalMessages((current) => [
      ...current,
      { id: tempId, roomId, text, status: "sending", mine: true },
    ]);
    setDraft("");
    updateTyping(false);

    sendMessage.mutate(
      { roomId, text, idempotencyKey: tempId },
      {
        onSuccess: (serverMessage) => {
          setLocalMessages((current) =>
            current.map((message) => (message.id === tempId ? serverMessage : message)),
          );
          void messages.refetch().catch(() => undefined);
        },
        onError: () => {
          setLocalMessages((current) =>
            current.map((message) =>
              message.id === tempId ? { ...message, status: "failed" } : message,
            ),
          );
        },
      },
    );
  };

  const updateDraft = (value: string) => {
    const nextDraft = value.slice(0, textLimit);
    setDraft(nextDraft);
    updateTyping(nextDraft.trim().length > 0);
  };

  const updateTyping = (typing: boolean) => {
    if (typingRef.current === typing) {
      return;
    }

    typingRef.current = typing;
    setTyping({ roomId, typing });
  };

  const retryMessages = () => {
    void messages.refetch().catch(() => undefined);
  };

  const report = (messageId: string) => {
    const showError = () => {
      Alert.alert("메시지를 신고하지 못했어요", "연결을 확인한 뒤 다시 시도해주세요.", [
        { text: "취소", style: "cancel" },
        { text: "다시 시도", onPress: () => report(messageId) },
      ]);
    };

    reportMessage.mutate(
      { messageId, reason: "사용자 신고" },
      {
        onSuccess: (reported) => {
          if (reported) {
            Alert.alert("신고했어요", "검토 후 필요한 조치를 진행할게요.");
            return;
          }
          showError();
        },
        onError: showError,
      },
    );
  };

  if (messages.loading && !messages.data) {
    return (
      <Screen avoidKeyboard includeTopInset={false}>
        <ContentState kind="loading" title="대화를 불러오고 있어요" />
      </Screen>
    );
  }

  if (messages.error && !messages.data) {
    return (
      <Screen avoidKeyboard includeTopInset={false}>
        <ContentState kind="error" onRetry={retryMessages} title="대화를 불러오지 못했어요" />
      </Screen>
    );
  }

  return (
    <Screen avoidKeyboard includeTopInset={false}>
      <ChatMessageList
        messages={data}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: !reducedMotion })}
        onReportMessage={report}
        scrollRef={listRef}
      />
      <ChatRoomStatus
        isPeerTyping={roomRealtime.isPeerTyping}
        readReceiptVersion={roomRealtime.readReceiptVersion}
      />
      <ChatComposer draft={draft} onChangeDraft={updateDraft} onSend={send} textLimit={textLimit} />
    </Screen>
  );
};
