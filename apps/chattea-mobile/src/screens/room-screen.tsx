import { randomUUID } from "expo-crypto";
import { Stack } from "expo-router";
import { memo, useCallback } from "react";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import type { ChatMessage } from "@/features/chat";
import {
  MessageComposer,
  MessageRow as MessageRowComponent,
  RoomMenuButton,
  updateChatMessageDraft,
  useChatRoom,
} from "@/features/chat";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const MessageRow = memo(MessageRowComponent);
MessageRow.displayName = "MessageRow";

const keyExtractor = (item: ChatMessage) => item.id;

const RoomScreen = () => {
  const insets = useSafeAreaInsets();
  const {
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
  } = useChatRoom();
  const messageList = messages.data?.chatMessages ?? [];
  const lastMineId = [...messageList].reverse().find((m) => m.senderUserId === currentUserId)?.id;
  const lastOtherId = [...messageList]
    .reverse()
    .find((m) => m.senderUserId && m.senderUserId !== currentUserId)?.id;
  const openRoomMenu = useCallback(() => {
    if (lastOtherId) reportMessage(lastOtherId);
  }, [lastOtherId, reportMessage]);
  const headerRight = useCallback(
    () => <RoomMenuButton onPress={openRoomMenu} />,
    [openRoomMenu],
  );
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const mine = item.senderUserId === currentUserId;
      return (
        <MessageRow
          createdAt={item.createdAt}
          id={item.id}
          mine={mine}
          onReport={reportMessage}
          showReadStatus={mine && item.id === lastMineId}
          text={item.text}
        />
      );
    },
    [currentUserId, lastMineId, reportMessage],
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
    <NativeScreen>
      <Stack.Screen
        options={{
          headerRight,
          title: roomName ?? "대화",
        }}
      />
      <NativeList
        alignItemsAtEnd
        contentContainerStyle={styles.listContent}
        data={messageList}
        getItemType={getItemType}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        maintainScrollAtEnd
        renderItem={renderMessage}
      />
      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <SafeAreaView edges={["bottom"]} style={styles.composerDock}>
          <MessageComposer
            disabled={!messageDraft || sendState.loading}
            maxLength={messageTextLimit}
            onChangeText={(text) =>
              setDraft((current) =>
                updateChatMessageDraft(current, text, messageTextLimit, randomUUID),
              )
            }
            onSend={() => void sendMessage()}
            value={draft.text}
          />
        </SafeAreaView>
      </KeyboardStickyView>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  listContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.control,
    paddingTop: theme.spacing.control,
  },
  composerDock: {
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.control,
    paddingTop: theme.spacing.sm,
  },
}));

export default RoomScreen;
