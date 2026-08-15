import { useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  LoadingState,
  MetaText,
  NativeCard,
  NativeScreen,
  NativeScroll,
} from "../components";
import { CHAT_ROOMS_QUERY } from "../operations";
import { ErrorState, type RoomsData, styles } from "./screen-shared";

export const RoomsScreen = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  return (
    <NativeScreen>
      <NativeScroll>
        {rooms.loading ? <LoadingState /> : null}
        {rooms.error ? <ErrorState /> : null}
        {!rooms.loading && !rooms.error && rooms.data?.chatRooms.length === 0 ? (
          <EmptyState
            title="아직 시작한 대화가 없어요"
            body="서로 관심이 닿으면 여기에서 대화를 이어갈 수 있어요."
          />
        ) : null}
        {rooms.data?.chatRooms.map((room) => (
          <Pressable
            key={room.id}
            onPress={() => router.push(`/rooms/${room.id}`)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.roomRow}>
                <View style={styles.roomText}>
                  <Text style={styles.postTitle}>{room.name}</Text>
                  <MetaText>{room.lastMessage ?? "첫 인사를 건네 보세요."}</MetaText>
                </View>
                {room.unreadCount > 0 ? (
                  <Text style={styles.unreadText}>새 메시지 {room.unreadCount}개</Text>
                ) : null}
              </View>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};
