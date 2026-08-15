import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeScreen,
  NativeScroll,
} from "../components";
import {
  CHAT_MESSAGES_QUERY,
  MARK_ROOM_READ_MUTATION,
  ME_QUERY,
  REPORT_MESSAGE_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "../operations";
import type { ChatMessage } from "../types";
import {
  type MeData,
  type MessagesData,
  NativeTextInput,
  showActionError,
  styles,
  useRouteParam,
} from "./screen-shared";

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
  const [text, setText] = useState("");

  useEffect(() => {
    if (roomId) void markRead({ variables: { input: { roomId } } });
  }, [markRead, roomId]);

  const sendMessage = async () => {
    if (!roomId || !text.trim()) return;
    try {
      await send({
        variables: {
          input: { roomId, text: text.trim(), idempotencyKey: `${Date.now()}-${Math.random()}` },
        },
      });
      setText("");
      void messages.refetch();
    } catch (error) {
      showActionError(error);
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

  return (
    <NativeScreen>
      <NativeScroll>
        {messages.loading ? <LoadingState /> : null}
        {messages.data?.chatMessages.map((message) => {
          const mine = message.senderUserId === me.data?.me.id;
          return (
            <View key={message.id} style={mine ? styles.messageMine : styles.messageOther}>
              <View style={mine ? styles.bubbleMine : styles.bubbleOther}>
                <Text style={mine ? styles.bubbleMineText : styles.bubbleOtherText}>
                  {message.text}
                </Text>
              </View>
              <View style={styles.messageMeta}>
                <MetaText>{formatRelativeDate(message.createdAt)}</MetaText>
                {!mine ? (
                  <NativeButton
                    label="신고"
                    onPress={() => reportMessage(message.id)}
                    tone="quiet"
                  />
                ) : null}
              </View>
            </View>
          );
        })}
        {!messages.loading && messages.data?.chatMessages.length === 0 ? (
          <EmptyState title="첫 인사를 기다리고 있어요" body="짧고 편안한 인사부터 건네 보세요." />
        ) : null}
        <View style={styles.composer}>
          <NativeTextInput
            maxLength={90}
            multiline
            onChangeText={setText}
            placeholder="메시지 입력"
            style={styles.input}
            value={text}
          />
          <NativeButton
            disabled={!text.trim() || sendState.loading}
            label="보내기"
            onPress={() => void sendMessage()}
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};
