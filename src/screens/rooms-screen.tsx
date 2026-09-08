import { memo, useCallback } from "react";

import { type RoomsData, useChatRooms } from "@/features/chat";
import { RoomRow as RoomRowComponent } from "@/features/chat";
import {
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
  const { rooms, openRoom } = useChatRooms();
  const renderRoom = useCallback(
    ({ item }: { item: NonNullable<RoomsData["chatRooms"]>[number] }) => (
      <RoomRow
        id={item.id}
        lastMessage={item.lastMessage}
        name={item.name}
        onOpen={openRoom}
        unreadCount={item.unreadCount}
      />
    ),
    [openRoom],
  );
  const empty = rooms.loading ? (
    <LoadingState />
  ) : rooms.error ? (
    <ErrorState />
  ) : (
    <EmptyState
      title="아직 시작한 대화가 없어요"
      body="서로 관심이 닿으면 여기에서 대화를 이어갈 수 있어요."
    />
  );

  return (
    <NativeScreen>
      <NativeList
        data={rooms.data?.chatRooms ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        renderItem={renderRoom}
      />
    </NativeScreen>
  );
};

export default RoomsScreen;
