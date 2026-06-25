import { LegendList } from "@legendapp/list/react-native";
import { useLocalSearchParams } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../shared/components/app-button";
import { AppInput } from "../../shared/components/app-input";
import { Screen } from "../../shared/components/screen";
import { colors, spacing } from "../../theme/tokens";
import {
  useCreateUpload,
  useMarkRoomRead,
  useMessages,
  useReportMessage,
  useRoomRealtime,
  useSendMessage,
  useSetTyping,
  useUploadFileToSignedUrl,
} from "./hooks";
import { pickImageAttachment } from "./image-picker";
import { getMessageTextLimit, normalizeMessageDraft } from "./message-limits";
import { AttachmentDraft, Message } from "./types";

export function ChatRoomScreen() {
  const { "room-id": roomId = "demo-room" } = useLocalSearchParams<{ "room-id": string }>();
  const messages = useMessages(roomId);
  const sendMessage = useSendMessage(roomId);
  const createUpload = useCreateUpload();
  const { mutate: markRoomRead } = useMarkRoomRead();
  const roomRealtime = useRoomRealtime(roomId);
  const reportMessage = useReportMessage();
  const { mutate: setTyping } = useSetTyping();
  const uploadFile = useUploadFileToSignedUrl();
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const typingRef = useRef(false);
  const data = [...(messages.data ?? []), ...localMessages];
  const textLimit = getMessageTextLimit(data.length > 0);

  useEffect(() => {
    if (messages.data?.length) {
      markRoomRead(roomId);
    }
  }, [markRoomRead, messages.data?.length, roomId]);

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        setTyping({ roomId, typing: false });
      }
    };
  }, [roomId, setTyping]);

  async function addAttachment() {
    const picked = await pickImageAttachment();
    if (!picked) {
      return;
    }

    const localId = `attachment-${Date.now()}`;
    const attachment: AttachmentDraft = {
      id: localId,
      filename: picked.filename,
      contentType: picked.contentType,
      status: "signing",
    };

    setAttachments((current) => [...current, attachment]);

    try {
      const upload = await createUpload.mutateAsync({
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
      setAttachments((current) =>
        current.map((item) =>
          item.id === localId
            ? { ...item, id: upload.id, putUrl: upload.putUrl, status: "uploading" }
            : item,
        ),
      );
      await uploadFile.mutateAsync({
        putUrl: upload.putUrl,
        contentType: attachment.contentType,
        body: picked.body,
      });
      setAttachments((current) =>
        current.map((item) => (item.id === upload.id ? { ...item, status: "uploaded" } : item)),
      );
    } catch {
      setAttachments((current) =>
        current.map((item) => (item.id === localId ? { ...item, status: "failed" } : item)),
      );
    }
  }

  function send() {
    const text = normalizeMessageDraft(draft, textLimit);
    if (!text) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setLocalMessages((current) => [
      ...current,
      { id: tempId, roomId, text, status: "sending", mine: true },
    ]);
    setDraft("");
    updateTyping(false);

    sendMessage.mutate(
      { roomId, text, idempotencyKey: tempId },
      {
        onSuccess(serverMessage) {
          setLocalMessages((current) =>
            current.map((message) => (message.id === tempId ? serverMessage : message)),
          );
        },
      },
    );
  }

  function updateDraft(value: string) {
    const nextDraft = value.slice(0, textLimit);
    setDraft(nextDraft);
    updateTyping(nextDraft.trim().length > 0);
  }

  function updateTyping(typing: boolean) {
    if (typingRef.current === typing) {
      return;
    }

    typingRef.current = typing;
    setTyping({ roomId, typing });
  }

  return (
    <Screen>
      <Text style={styles.title}>대화</Text>
      <LegendList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onReport={() => reportMessage.mutate({ messageId: item.id, reason: "사용자 신고" })}
          />
        )}
        contentContainerStyle={styles.list}
      />
      {roomRealtime.isPeerTyping ? <Text style={styles.presence}>상대가 입력 중...</Text> : null}
      {roomRealtime.readReceiptVersion > 0 ? (
        <Text style={styles.status}>읽음 상태 업데이트됨</Text>
      ) : null}
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.attachment}>
          <Text style={styles.text}>{attachment.filename}</Text>
          <Text style={styles.status}>{attachment.status}</Text>
        </View>
      ))}
      <AppButton onPress={addAttachment} title="이미지 첨부" />
      <AppInput
        label={`메시지 ${draft.length}/${textLimit}`}
        maxLength={textLimit}
        onChangeText={updateDraft}
        value={draft}
      />
      <AppButton onPress={send} title="보내기" />
    </Screen>
  );
}

const MessageBubble = memo(function MessageBubble({
  message,
  onReport,
}: {
  message: Message;
  onReport: () => void;
}) {
  const fade = useRef(new Animated.Value(1)).current;
  const previousTextRef = useRef("");
  const [segments, setSegments] = useState({ base: "", suffix: message.text });

  useEffect(() => {
    const previousText = previousTextRef.current;
    const base = message.text.startsWith(previousText) ? previousText : "";
    const suffix = base ? message.text.slice(base.length) : message.text;

    setSegments({ base, suffix });
    previousTextRef.current = message.text;
    fade.setValue(0);
    Animated.timing(fade, {
      duration: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fade, message.text]);

  return (
    <View style={[styles.bubble, message.mine && styles.mine]}>
      <Text style={styles.text}>
        {segments.base}
        <Animated.Text style={{ opacity: fade }}>{segments.suffix}</Animated.Text>
      </Text>
      <Text style={styles.status}>{message.status}</Text>
      <AppButton onPress={onReport} title="신고" />
    </View>
  );
});

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  list: {
    gap: spacing.sm,
  },
  bubble: {
    alignSelf: "flex-start",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: "82%",
    padding: spacing.md,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#ecfeff",
  },
  text: {
    color: colors.text,
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  presence: {
    color: colors.primary,
    fontSize: 13,
  },
  attachment: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.sm,
  },
});
