import { randomUUID } from "expo-crypto";
import { memo, useCallback } from "react";
import { StyleSheet } from "react-native-unistyles";

import type { ChatMessage } from "@/features/chat";
import {
  MessageRow as MessageRowComponent,
  updateChatMessageDraft,
  useChatRoom,
} from "@/features/chat";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeButton,
  NativeComposer,
  NativeKeyboardScreen,
  NativeList,
  NativeTextInput,
} from "@/shared/components";

const MessageRow = memo(MessageRowComponent);
MessageRow.displayName = "MessageRow";

const keyExtractor = (item: ChatMessage) => item.id;

const RoomScreen = () => {
  const {
    messages,
    draft,
    setDraft,
    messageTextLimit,
    messageDraft,
    sendState,
    sendMessage,
    reportMessage,
    currentUserId,
  } = useChatRoom();
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

const styles = StyleSheet.create((theme) => ({
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
  },
}));

export default RoomScreen;
