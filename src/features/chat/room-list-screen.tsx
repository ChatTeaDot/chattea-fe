import { LegendList } from "@legendapp/list/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components";
import { colors, spacing } from "@/theme/tokens";

import { useRooms } from "./hooks";
import { RoomListItem } from "./room-list-item";
import { Room } from "./types";

export const RoomListScreen = () => {
  const rooms = useRooms();

  const renderRoom = ({ item }: { item: Room }) => {
    return <RoomListItem room={item} />;
  };

  return (
    <Screen>
      <Text style={styles.title}>채팅</Text>
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});
