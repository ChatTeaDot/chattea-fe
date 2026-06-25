import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../../shared/components/screen";
import { colors, spacing } from "../../theme/tokens";
import { useRooms } from "./hooks";
import { Room } from "./types";

export function RoomListScreen() {
  const rooms = useRooms();

  function renderRoom({ item }: { item: Room }) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/room/${item.id}`)}
        style={styles.row}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.lastMessage}</Text>
      </Pressable>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>채팅</Text>
      <LegendList
        data={rooms.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    color: colors.muted,
  },
});
