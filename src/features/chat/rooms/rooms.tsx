import { LegendList } from "@legendapp/list/react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentState, Screen } from "@/shared/components";
import { spacing } from "@/theme/tokens";

import { useRooms } from "../hooks";
import { Room } from "../types";
import { RoomListItem } from "./components";

export const RoomListScreen = () => {
  const rooms = useRooms();

  const renderRoom = ({ item }: { item: Room }) => {
    return <RoomListItem room={item} />;
  };

  return (
    <Screen>
      {rooms.loading ? <ContentState kind="loading" /> : null}
      {rooms.error ? <ContentState kind="error" /> : null}
      {!rooms.loading && !rooms.error && rooms.data?.length === 0 ? (
        <ContentState
          kind="empty"
          title="아직 시작한 대화가 없어요"
          message="서로 좋아요를 보내면 대화를 시작할 수 있어요."
        />
      ) : null}
      <LegendList
        recycleItems={false}
        data={rooms.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        style={styles.listFrame}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});
