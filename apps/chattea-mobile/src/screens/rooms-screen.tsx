import { memo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import {
  ROOM_ROW_ESTIMATED_HEIGHT,
  RoomRow as RoomRowComponent,
  type RoomsData,
  useChatRooms,
} from "@/features/chat";
import { useTranslation } from "@/i18n";
import {
  AppButton,
  EmptyState,
  ErrorState,
  LoadingState,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const RoomRow = memo(RoomRowComponent);
RoomRow.displayName = "RoomRow";

const keyExtractor = (item: RoomsData["chatRooms"][number]) => item.id;

const RoomsScreen = () => {
  const { t } = useTranslation("chat");
  const { rooms, openRoom, prefetchRoom } = useChatRooms();
  const roomList = rooms.data?.chatRooms ?? [];
  const firstUnreadId = roomList.find((room) => room.unreadCount > 0)?.id;
  const renderRoom = ({ item }: { item: NonNullable<RoomsData["chatRooms"]>[number] }) => (
    <RoomRow
      id={item.id}
      lastMessage={item.lastMessage}
      name={item.name}
      onOpen={openRoom}
      onPressIn={prefetchRoom}
      unreadCount={item.unreadCount}
    />
  );
  const empty = rooms.loading ? (
    <LoadingState />
  ) : rooms.error ? (
    <ErrorState />
  ) : (
    <EmptyState title={t("rooms.emptyTitle")} body={t("rooms.emptyBody")} />
  );

  return (
    <NativeScreen>
      <NativeList
        contentContainerStyle={styles.listContent}
        data={roomList}
        estimatedItemSize={ROOM_ROW_ESTIMATED_HEIGHT}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        renderItem={renderRoom}
      />
      <View style={styles.footer}>
        <AppButton
          disabled={!firstUnreadId}
          onPress={() => firstUnreadId && openRoom(firstUnreadId)}
          title={t("rooms.openUnread")}
        />
      </View>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  listContent: {
    gap: 0,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: 0,
  },
  footer: {
    borderTopColor: theme.colors.surface,
    borderTopWidth: 1,
    paddingBottom: rt.insets.bottom + theme.sizes.tabBar + theme.spacing.md,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.xs,
  },
}));

export default RoomsScreen;
