import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { colors, spacing } from "@/theme/tokens";

import { useRooms } from "./hooks";
import { Room } from "./types";

export const RoomListScreen = () => {
  const rooms = useRooms();

  const renderRoom = ({ item }: { item: Room }) => {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/room/${item.id}`)}
        style={styles.row}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.roomText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.message}>{item.lastMessage || "아직 대화가 없어요"}</Text>
        </View>
      </Pressable>
    );
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
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  roomText: {
    flex: 1,
    gap: spacing.xs,
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
