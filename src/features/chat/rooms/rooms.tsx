import { LegendList } from "@legendapp/list/react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

import { useRooms } from "../hooks";
import { Room } from "../types";
import { RoomListItem } from "./components";

export const RoomListScreen = () => {
  const rooms = useRooms();

  const renderRoom = ({ item }: { item: Room }) => {
    return <RoomListItem room={item} />;
  };

  if (rooms.loading) {
    return (
      <Screen>
        <ContentState kind="loading" />
      </Screen>
    );
  }

  if (rooms.error) {
    return (
      <Screen>
        <ContentState kind="error" onRetry={() => void rooms.refetch().catch(() => undefined)} />
      </Screen>
    );
  }

  if (rooms.data?.length === 0) {
    return (
      <Screen>
        <ContentState
          kind="empty"
          title="아직 시작한 대화가 없어요"
          message="서로 좋아요를 보내면 대화를 시작할 수 있어요."
        />
      </Screen>
    );
  }

  return (
    <Screen>
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

const styles = StyleSheet.create((theme: AppTheme) => ({
  list: {
    gap: theme.spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
}));
