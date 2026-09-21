import { LegendList, type LegendListProps } from "@legendapp/list/react-native";
import { HeaderHeightContext } from "expo-router/react-navigation";
import { use } from "react";
import { Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeList = <ItemT,>({
  contentContainerStyle,
  ListHeaderComponentStyle,
  style,
  ...props
}: LegendListProps<ItemT>) => {
  const headerHeight = use(HeaderHeightContext) ?? 0;
  return (
    <LegendList
      {...props}
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      contentInset={{ bottom: 0, left: 0, right: 0, top: headerHeight }}
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
