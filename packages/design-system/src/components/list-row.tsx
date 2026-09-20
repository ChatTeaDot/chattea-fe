import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ListRowProps = {
  title: string;
  icon?: ReactNode;
  side?: ReactNode;
  onPress?: () => void;
  last?: boolean;
};

const ListRow = ({ title, icon, side, onPress, last = false }: ListRowProps) => {
  const body = (
    <>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {title}
        </Text>
      </View>
      {side}
    </>
  );
  if (!onPress) {
    return <View style={[styles.row, !last && styles.rowSeparated]}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowSeparated,
        pressed && styles.rowPressed,
      ]}
    >
      {body}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.control,
    minHeight: 56,
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.control,
  },
  rowSeparated: {
    borderBottomColor: theme.colors.surface,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: theme.colors.surface,
  },
  rowIcon: {
    alignItems: "center",
    width: 24,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
}));

export default ListRow;
