import { useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  LoadingState,
  MetaText,
  NativeCard,
  NativeList,
  NativeScreen,
} from "@/features/native/components";
import { CHAT_ROOMS_QUERY } from "@/features/native/operations";

import { ErrorState, type RoomsData, styles } from "./screen-shared";

type RoomRowProps = {
  id: string;
  lastMessage: string | null;
  name: string;
  onOpen: (id: string) => void;
  unreadCount: number;
};

const RoomRow = memo(({ id, lastMessage, name, onOpen, unreadCount }: RoomRowProps) => {
  const open = useCallback(() => onOpen(id), [id, onOpen]);
  return (
    <Pressable accessibilityRole="link" onPress={open} style={styles.pressableCard}>
      <NativeCard>
        <View style={styles.roomRow}>
          <View style={styles.roomText}>
            <Text style={styles.postTitle}>{name}</Text>
            <MetaText>{lastMessage ?? "첫 인사를 건네 보세요."}</MetaText>
          </View>
          {unreadCount > 0 ? (
            <Text style={styles.unreadText}>새 메시지 {unreadCount}개</Text>
          ) : null}
        </View>
      </NativeCard>
    </Pressable>
  );
});
RoomRow.displayName = "RoomRow";

const keyExtractor = (item: RoomsData["chatRooms"][number]) => item.id;

export const RoomsScreen = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  const openRoom = useCallback((id: string) => router.push(`/rooms/${id}`), []);
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
