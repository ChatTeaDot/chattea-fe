import { useMutation, useQuery } from "@apollo/client/react";
import { randomUUID } from "expo-crypto";
import { memo, useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  createChatMessageDraft,
  getMessageTextLimit,
  hasConversationStarted,
  normalizeMessageDraft,
  toSendChatMessageVariables,
  updateChatMessageDraft,
} from "@/features/native/chat/message-policy";
import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeComposer,
  NativeKeyboardScreen,
  NativeList,
} from "@/features/native/components";
import {
  CHAT_MESSAGES_QUERY,
  MARK_ROOM_READ_MUTATION,
  ME_QUERY,
  REPORT_MESSAGE_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "@/features/native/operations";
import type { ChatMessage } from "@/features/native/types";

import {
  ErrorState,
  type MeData,
  type MessagesData,
  NativeTextInput,
  showActionError,
  styles,
  useRouteParam,
} from "./screen-shared";

type MessageRowProps = {
  createdAt: string;
  id: string;
  mine: boolean;
  onReport: (id: string) => void;
  text: string;
};

const MessageRow = memo(({ createdAt, id, mine, onReport, text }: MessageRowProps) => {
  const report = useCallback(() => onReport(id), [id, onReport]);
  return (
    <View style={mine ? styles.messageMine : styles.messageOther}>
      <View style={mine ? styles.bubbleMine : styles.bubbleOther}>
        <Text style={mine ? styles.bubbleMineText : styles.bubbleOtherText}>{text}</Text>
      </View>
      <View style={styles.messageMeta}>
        <MetaText>{formatRelativeDate(createdAt)}</MetaText>
        {!mine ? <NativeButton label="신고" onPress={report} tone="quiet" /> : null}
      </View>
    </View>
  );
});
MessageRow.displayName = "MessageRow";

const keyExtractor = (item: ChatMessage) => item.id;

export const RoomScreen = () => {
  const roomId = useRouteParam("room-id");
  const me = useQuery<MeData>(ME_QUERY);
  const messages = useQuery<MessagesData>(CHAT_MESSAGES_QUERY, {
    skip: !roomId,
    variables: { input: { roomId, first: 100 } },
    pollInterval: 8_000,
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
    } catch (error) {
      showActionError(error);
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
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageRow
        createdAt={item.createdAt}
        id={item.id}
        mine={item.senderUserId === currentUserId}
        onReport={reportMessage}
        text={item.text}
      />
    ),
    [currentUserId, reportMessage],
  );
  const getItemType = useCallback(
    (item: ChatMessage) => (item.senderUserId === currentUserId ? "mine" : "other"),
    [currentUserId],
  );
  const empty = messages.loading ? (
    <LoadingState />
  ) : messages.error ? (
    <ErrorState />
  ) : (
    <EmptyState title="첫 인사를 기다리고 있어요" body="짧고 편안한 인사부터 건네 보세요." />
  );

  return (
    <NativeKeyboardScreen>
      <NativeList
        alignItemsAtEnd
        data={messages.data?.chatMessages ?? []}
        getItemType={getItemType}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        maintainScrollAtEnd
        renderItem={renderMessage}
      />
      <NativeComposer>
        <NativeTextInput
          maxLength={messageTextLimit}
          multiline
          onChangeText={(text) =>
            setDraft((current) =>
              updateChatMessageDraft(current, text, messageTextLimit, randomUUID),
            )
          }
          placeholder="메시지 입력"
          style={styles.input}
          value={draft.text}
        />
        <NativeButton
          disabled={!messageDraft || sendState.loading}
          label="보내기"
          onPress={() => void sendMessage()}
        />
      </NativeComposer>
    </NativeKeyboardScreen>
  );
};
