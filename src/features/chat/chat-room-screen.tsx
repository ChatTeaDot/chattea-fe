import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components";
import { colors } from "@/theme/tokens";

import { AttachmentList } from "./attachment-list";
import { ChatComposer } from "./chat-composer";
import { ChatMessageList } from "./chat-message-list";
import { ChatRoomStatus } from "./chat-room-status";
import {
  useChatAttachments,
  useMarkRoomRead,
  useMessages,
  useReportMessage,
  useRoomRealtime,
  useSendMessage,
  useSetTyping,
} from "./hooks";
import { getMessageTextLimit, normalizeMessageDraft } from "./message-limits";
import { Message } from "./types";

export const ChatRoomScreen = () => {
  const { "room-id": roomId = "demo-room" } = useLocalSearchParams<{ "room-id": string }>();
  const messages = useMessages(roomId);
  const sendMessage = useSendMessage(roomId);
  const { mutate: markRoomRead } = useMarkRoomRead();
  const roomRealtime = useRoomRealtime(roomId);
  const reportMessage = useReportMessage();
  const { mutate: setTyping } = useSetTyping();
  const { addAttachment, attachments } = useChatAttachments();
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const listRef = useRef<ScrollView | null>(null);
  const tempIdRef = useRef(0);
  const typingRef = useRef(false);
  const data = dedupeMessages([...(messages.data ?? []), ...localMessages]);
  const textLimit = getMessageTextLimit(data.length > 0);

  useEffect(() => {
    if (messages.data?.length) {
      markRoomRead(roomId);
    }
  }, [markRoomRead, messages.data?.length, roomId]);

  useEffect(() => {
    if (data.length > 0) {
      void listRef.current?.scrollToEnd({ animated: true });
    }
  }, [data.length]);

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
          void messages.refetch();
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

  return (
    <Screen>
      <Text style={styles.title}>대화</Text>
      <ChatMessageList
        messages={data}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onReportMessage={(messageId) => reportMessage.mutate({ messageId, reason: "사용자 신고" })}
        scrollRef={listRef}
      />
      <ChatRoomStatus
        isPeerTyping={roomRealtime.isPeerTyping}
        readReceiptVersion={roomRealtime.readReceiptVersion}
      />
      <AttachmentList attachments={attachments} />
      <ChatComposer
        draft={draft}
        onAddAttachment={addAttachment}
        onChangeDraft={updateDraft}
        onSend={send}
        textLimit={textLimit}
      />
    </Screen>
  );
};

const dedupeMessages = (messages: Message[]) => {
  return messages.filter((message, index, source) => {
    return source.findIndex((item) => item.id === message.id) === index;
  });
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
});
