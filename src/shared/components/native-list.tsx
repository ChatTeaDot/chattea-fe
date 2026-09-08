import { LegendList, type LegendListProps } from "@legendapp/list/react-native";
import { Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeList = <ItemT,>({
  contentContainerStyle,
  ListHeaderComponentStyle,
  style,
  ...props
}: LegendListProps<ItemT>) => {
  return (
    <LegendList
      {...props}
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponentStyle={[styles.listHeader, ListHeaderComponentStyle]}
      recycleItems
      showsVerticalScrollIndicator={false}
      style={[styles.listFrame, style]}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  listFrame: {
    flex: 1,
  },
  listContent: {
    gap: theme.spacing.lg,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.md,
  },
  listHeader: {
    paddingBottom: theme.spacing.lg,
  },
}));

export default NativeList;
